import { module, test } from "qunit";
import migrate from "../../../../migrations/settings/0001-migrate-from-deprecated-icon-names.js";

module(
  "Unit | Migrations | Settings | 0001-migrate-from-deprecated-icon-names.js",
  function () {
    test("migrate", function (assert) {
      const settings = new Map(
        Object.entries({
          category_icon_list:
            "meta,fab-facebook,#CC0000,partial|x,fab-twitter,#CC0011,full|config,fab-cog,#CC0012,partial|group,user-friends,#CC0001,",
          svg_icons: "fab-facebook|fab-twitter|fab-cog|user-friends",
        })
      );

      const result = migrate(settings);

      const expectedResult = new Map(
        Object.entries({
          category_icon_list:
            "meta,fab-facebook,#CC0000,partial|x,fab-twitter,#CC0011,full|config,fab fa-gear,#CC0012,partial|group,user-group,#CC0001,",
          svg_icons: "fab-facebook|fab-twitter|fab-gear|user-group",
        })
      );
      assert.deepEqual(Array.from(result), Array.from(expectedResult));
    });
  }
);
