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

      function getIconItem(categorySlug) {
        if (!categorySlug) {
          return;
        }

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
        let descriptionText = get(category, "description_text");
        let restricted = get(category, "read_restricted");
        let url = opts.url
          ? opts.url
          : getURL(`/c/${Category.slugFor(category)}/${get(category, "id")}`);
        let href = opts.link === false ? "" : url;
        let tagName =
          opts.link === false || opts.link === "false" ? "span" : "a";
        let extraClasses = opts.extraClasses ? " " + opts.extraClasses : "";
        let html = "";
        let parentCat = null;
        let categoryDir = "";
        let dataAttributes = category
          ? `data-category-id="${get(category, "id")}"`
          : "";

        /// Add custom category icon from theme settings
        let iconItem = getIconItem(category.slug);

        if (!opts.hideParent) {
          parentCat = Category.findById(get(category, "parent_category_id"));
        }

        let classNames = `badge-category ${iconItem ? "--has-icon" : ""}`;
        if (restricted) {
          classNames += " restricted";
        }

        if (parentCat) {
          classNames += ` --has-parent`;
          dataAttributes += ` data-parent-category-id="${parentCat.id}"`;
        }

        html += `<span 
          ${dataAttributes} 
          data-drop-close="true" 
          class="${classNames}" 
          ${descriptionText ? 'title="' + descriptionText + '" ' : ""}
        >`;

        if (iconItem) {
          let itemColor = iconItem[2] ? `style="color: ${iconItem[2]}"` : "";
          let itemIcon = iconItem[1] !== "" ? iconHTML(iconItem[1]) : "";
          html += `<span ${itemColor} class="badge-category__icon">${itemIcon}</span>`;
        }
        /// End custom category icon

        let categoryName = escapeExpression(get(category, "name"));

        if (siteSettings.support_mixed_text_direction) {
          categoryDir = isRTL(categoryName) ? 'dir="rtl"' : 'dir="ltr"';
        }

        if (restricted) {
          html += iconHTML(lockIcon);
        }
        html += `<span class="badge-category__name" ${categoryDir}>${categoryName}</span>`;
        html += "</span>";

        if (opts.topicCount) {
          html += buildTopicCount(opts.topicCount);
        }

        if (href) {
          href = ` href="${href}" `;
        }

        let afterBadgeWrapper = "";

        if (opts.plusSubcategories && opts.lastSubcategory) {
          afterBadgeWrapper += `<span class="plus-subcategories">
            ${I18n.t("category_row.plus_subcategories", {
              count: opts.plusSubcategories,
            })}
            </span>`;
        }
        return `<${tagName} class="badge-category__wrapper ${extraClasses}" ${href}>${html}</${tagName}>${afterBadgeWrapper}`;
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

      if (api.registerCustomCategorySectionLinkLockIcon) {
        api.registerCustomCategorySectionLinkLockIcon(lockIcon);
      }

      if (api.registerCustomCategorySectionLinkPrefix) {
        const site = api.container.lookup("service:site");

        categoryThemeList.forEach((str) => {
          const [slug, icon, color, match] = str.split(",");

          if (slug && icon && color) {
            const category = site.categories.find((cat) => {
              if (match === "partial") {
                return cat.slug.toLowerCase().includes(slug.toLowerCase());
              } else {
                return cat.slug.toLowerCase() === slug.toLowerCase();
              }
            });

            if (category) {
              const opts = {
                categoryId: category.id,
                prefixType: "icon",
                prefixValue: icon,
              };

              if (!color.match(/categoryColo(u*)r/g)) {
                opts.prefixColor = color.replace(/^#/, "");
              }

              api.registerCustomCategorySectionLinkPrefix(opts);
            }
          }
        });
      }
    });
  },
};
