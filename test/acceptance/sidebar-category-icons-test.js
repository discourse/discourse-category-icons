import { test } from "qunit";
import {
  acceptance,
  exists,
  query,
  updateCurrentUser,
} from "discourse/tests/helpers/qunit-helpers";
import { visit } from "@ember/test-helpers";
import Site from "discourse/models/site";

acceptance("Sidebar - Category icons", function (needs) {
  needs.user();

  let category1;
  let category2;

  needs.hooks.beforeEach(() => {
    const categories = Site.current().categories;
    category1 = categories[0];
    category2 = categories[1];

    settings.category_lock_icon = "wrench";
    settings.category_icon_list = `${category1.slug},wrench,#FF0000|${category2.slug},question-circle,categoryColor`;
  });

  test("Icon for category when `category_icon_list` theme setting has been configured", async function (assert) {
    category2.color = "000000";

    updateCurrentUser({
      sidebar_category_ids: [category1.id, category2.id],
    });

    await visit("/");

    assert.ok(
      exists(
        `.sidebar-section-link-wrapper[data-category-id="${category1.id}"] .prefix-icon.d-icon-wrench`
      ),
      `wrench icon is displayed for ${category1.slug} section link's prefix icon`
    );

    assert.strictEqual(
      query(
        `.sidebar-section-link-wrapper[data-category-id="${category1.id}"] .sidebar-section-link-prefix`
      ).style.color,
      "rgb(255, 0, 0)",
      `${category1.slug} section link's prefix icon has the right color`
    );

    assert.ok(
      exists(
        `.sidebar-section-link-wrapper[data-category-id="${category2.id}"] .prefix-icon.d-icon-question-circle`
      ),
      `question-circle icon is displayed for ${category2.slug} section link's prefix icon`
    );

    assert.strictEqual(
      query(
        `.sidebar-section-link-wrapper[data-category-id="${category2.id}"] .sidebar-section-link-prefix`
      ).style.color,
      "rgb(0, 0, 0)",
      `${category2.slug} section link's prefix icon has the right color`
    );
  });

  test("Prefix badge icon for read restricted categories when `category_lock_icon` theme setting is set", async function (assert) {
    category1.read_restricted = true;

    updateCurrentUser({
      sidebar_category_ids: [category1.id],
    });

    await visit("/");

    assert.ok(
      exists(
        `.sidebar-section-link-wrapper[data-category-id="${category1.id}"] .prefix-badge.d-icon-wrench`
      ),
      "wrench icon is displayed for the section link's prefix badge"
    );
  });
});
