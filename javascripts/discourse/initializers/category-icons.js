import { withPluginApi } from "discourse/lib/plugin-api";
import Category from "discourse/models/category";
import { helperContext } from "discourse-common/lib/helpers";
import { iconHTML, iconNode } from "discourse-common/lib/icon-library";
import { isRTL } from "discourse/lib/text-direction";
import { h } from "virtual-dom";
import getURL from "discourse-common/lib/get-url";
import categoryTitleLink from "discourse/components/category-title-link";
import categoriesBoxes from "discourse/components/categories-boxes";
import categoriesBoxesWithTopics from "discourse/components/categories-boxes-with-topics";
import I18n from "I18n";
import { get } from "@ember/object";
import { escapeExpression } from "discourse/lib/utilities";

export default {
  name: "category-icons",

  initialize() {
    withPluginApi("0.8.26", (api) => {
      let categoryThemeList = settings.category_icon_list.split("|");
      let lockIcon = settings.category_lock_icon || "lock";

      categoryTitleLink.reopen({
        lockIcon,
      });

      categoriesBoxes.reopen({
        lockIcon,
      });

      categoriesBoxesWithTopics.reopen({
        lockIcon,
      });

      function categoryStripe(color, classes) {
        let style = color ? "style='background-color: #" + color + ";'" : "";
        return "<span class='" + classes + "' " + style + "></span>";
      }

      function getIconItem(categorySlug) {
        if (!categorySlug) {return;}

        let categoryThemeItem = categoryThemeList.find((str) =>
          str.indexOf(",") > -1
            ? categorySlug.indexOf(str.substr(0, str.indexOf(","))) > -1
            : ""
        );
        if (categoryThemeItem) {
          let iconItem = categoryThemeItem.split(",");
          // Test partial/exact match
          if (iconItem[3] === "partial") {
            return iconItem;
          } else if (iconItem[0] === categorySlug) {
            return iconItem;
          }
        }
      }

      function buildTopicCount(count) {
        return `<span class="topic-count" aria-label="${I18n.t(
          "category_row.topic_count",
          { count }
        )}">&times; ${count}</span>`;
      }

      function categoryIconsRenderer(category, opts) {
        let siteSettings = helperContext().siteSettings;
        let description = get(category, "description_text");
        let restricted = get(category, "read_restricted");
        let url = opts.url
          ? opts.url
          : getURL(`/c/${Category.slugFor(category)}/${get(category, "id")}`);
        let href = opts.link === false ? "" : url;
        let tagName =
          opts.link === false || opts.link === "false" ? "span" : "a";
        let extraClasses = opts.extraClasses ? " " + opts.extraClasses : "";
        let color = get(category, "color");
        let html = "";
        let parentCat = null;
        let categoryDir = "";

        if (!opts.hideParent) {
          parentCat = Category.findById(get(category, "parent_category_id"));
        }

        const categoryStyle = opts.categoryStyle || siteSettings.category_style;
        if (categoryStyle !== "none") {
          if (parentCat && parentCat !== category) {
            html += categoryStripe(
              get(parentCat, "color"),
              "badge-category-parent-bg"
            );
          }
          html += categoryStripe(color, "badge-category-bg");
        }

        let classNames = "badge-category clear-badge";
        if (restricted) {
          classNames += " restricted";
        }

        let style = "";
        if (categoryStyle === "box") {
          style = `style="color: #${get(category, "text_color")};"`;
        }

        html +=
          `<span ${style} ` +
          'data-drop-close="true" class="' +
          classNames +
          '"' +
          (description
            ? 'title="' + escapeExpression(description) + '" '
            : "") +
          ">";

        /// Add custom category icon from theme settings
        let iconItem = getIconItem(category.slug);
        if (iconItem) {
          let itemColor = iconItem[2]
            ? iconItem[2].match(/categoryColo(u*)r/)
              ? `style="color: #${color}"`
              : `style="color: ${iconItem[2]}"`
            : "";
          let itemIcon = iconItem[1] !== "" ? iconHTML(iconItem[1]) : "";
          html += `<span ${itemColor} class="category-badge-icon">${itemIcon}</span>`;
        }
        /// End custom category icon

        let categoryName = escapeExpression(get(category, "name"));

        if (siteSettings.support_mixed_text_direction) {
          categoryDir = isRTL(categoryName) ? 'dir="rtl"' : 'dir="ltr"';
        }

        if (restricted) {
          html += iconHTML(lockIcon);
        }
        html += `<span class="category-name" ${categoryDir}>${categoryName}</span></span>`;

        if (opts.topicCount && categoryStyle !== "box") {
          html += buildTopicCount(opts.topicCount);
        }

        if (href) {
          href = ` href="${href}" `;
        }

        extraClasses = categoryStyle
          ? categoryStyle + extraClasses
          : extraClasses;

        let afterBadgeWrapper = "";
        if (opts.topicCount && categoryStyle === "box") {
          afterBadgeWrapper += buildTopicCount(opts.topicCount);
        }
        return `<${tagName} class="badge-wrapper ${extraClasses}" ${href}>${html}</${tagName}>${afterBadgeWrapper}`;
      }

      api.replaceCategoryLinkRenderer(categoryIconsRenderer);

      api.createWidget("category-icon", {
        tagName: "div.category-icon-widget",
        html(attrs) {
          let iconItem = getIconItem(attrs.category.slug);
          if (iconItem) {
            let itemColor = iconItem[2]
              ? iconItem[2].match(/categoryColo(u*)r/g)
                ? `color: #${attrs.category.color}`
                : `color: ${iconItem[2]}`
              : "";
            let itemIcon = iconItem[1] !== "" ? iconNode(iconItem[1]) : "";
            return h("span.category-icon", { style: itemColor }, itemIcon);
          }
        },
      });
    });
  },
};
