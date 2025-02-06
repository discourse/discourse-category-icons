import { getOwner } from "@ember/owner";
import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import {
  acceptance,
  updateCurrentUser,
} from "discourse/tests/helpers/qunit-helpers";

acceptance("Sidebar - Category icons", function (needs) {
  needs.user();

  needs.site({
    categories: [
      {
        id: 1,
        name: "Category 1",
        slug: "category-1",
        color: "111111",
      },
      {
        id: 2,
        name: "Category 2",
        slug: "category-2",
        color: "000000",
      },
    ],
  });

  needs.hooks.beforeEach(function () {
    settings.category_lock_icon = "wrench";
    settings.category_icon_list = `category-1,wrench,#FF0000|category-2,circle-question,categoryColor`;
  });

  test("Icon for category when `category_icon_list` theme setting has been configured", async function (assert) {
    updateCurrentUser({ sidebar_category_ids: [1, 2] });

    await visit("/");

    assert
      .dom(
        `.sidebar-section-link-wrapper[data-category-id="1"] .prefix-icon.d-icon-wrench`
      )
      .exists(
        "wrench icon is displayed for category-1 section link's prefix icon"
      );

    assert
      .dom(
        `.sidebar-section-link-wrapper[data-category-id="1"] .sidebar-section-link-prefix`
      )
      .hasStyle(
        { color: "rgb(255, 0, 0)" },
        "category-1 section link's prefix icon has the right color"
      );

    assert
      .dom(
        `.sidebar-section-link-wrapper[data-category-id="2"] .prefix-icon.d-icon-circle-question`
      )
      .exists(
        "circle-question icon is displayed for category-2 section link's prefix icon"
      );

    assert
      .dom(
        `.sidebar-section-link-wrapper[data-category-id="2"] .sidebar-section-link-prefix`
      )
      .hasStyle(
        { color: "rgb(0, 0, 0)" },
        "category-2 section link's prefix icon has the right color"
      );
  });

  test("Prefix badge icon for read restricted categories when `category_lock_icon` theme setting is set", async function (assert) {
    const site = getOwner(this).lookup("service:site");
    site.categories[0].read_restricted = true;
    updateCurrentUser({ sidebar_category_ids: [1] });

    await visit("/");

    assert
      .dom(
        `.sidebar-section-link-wrapper[data-category-id="1"] .prefix-badge.d-icon-wrench`
      )
      .exists("wrench icon is displayed for the section link's prefix badge");
  });
});
