import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import TopicFixtures from "discourse/tests/fixtures/topic";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

function makeHashtagHTML(category) {
  return `<a class=\"hashtag-cooked\" href=\"${category.href}\" data-type=\"category\" data-slug=\"${category.slug}\" data-id=\"${category.id}\"><span class=\"hashtag-icon-placeholder\"><svg class=\"fa d-icon d-icon-square-full svg-icon svg-node\"><use href=\"#square-full\"></use></svg></span><span>${category.name}</span></a>`;
}

acceptance("Post body - Category icons", function (needs) {
  needs.user();

  const categories = [
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
    {
      id: 3,
      name: "Category 3",
      slug: "category-3",
      color: "888888",
    },
  ];

  needs.site({
    categories,
  });

  needs.hooks.beforeEach(function () {
    settings.category_lock_icon = "wrench";
    settings.category_icon_list = `category-1,wrench,#FF0000|category-2,circle-question,categoryColor`;
  });

  needs.pretender((server, helper) => {
    server.get("/t/131.json", () => {
      const topicList = cloneJSON(TopicFixtures["/t/130.json"]);
      topicList.post_stream.posts[0].cooked = `<p>${makeHashtagHTML(
        categories[0]
      )} ${makeHashtagHTML(categories[1])} ${makeHashtagHTML(
        categories[2]
      )}</p>`;
      return helper.response(topicList);
    });
  });

  test("Icon for category when `category_icon_list` theme setting has been configured", async function (assert) {
    await visit("/t/131");

    assert
      .dom(
        `.cooked .hashtag-cooked[data-id="1"] .hashtag-category-icon .d-icon-wrench`
      )
      .exists("wrench icon is displayed for category-1");

    assert
      .dom(`.cooked .hashtag-cooked[data-id="1"] .hashtag-category-icon`)
      .hasStyle(
        { color: "rgb(255, 0, 0)" },
        "category-1 's icon has the right color"
      );

    assert
      .dom(
        `.cooked .hashtag-cooked[data-id="2"] .hashtag-category-icon .d-icon-circle-question`
      )
      .exists("circle-question icon is displayed for category-2");

    assert
      .dom(`.cooked .hashtag-cooked[data-id="2"] .hashtag-category-icon`)
      .hasStyle(
        { color: "rgb(0, 0, 0)" },
        "category-2 's icon has the right categoryColor"
      );

    assert
      .dom(`.cooked .hashtag-cooked[data-id="3"] .hashtag-category-square`)
      .exists("unconfigured categories have a default badge");
  });
});
