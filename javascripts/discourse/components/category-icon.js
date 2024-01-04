/* This component is used in the Category banners theme component */
/* https://meta.discourse.org/t/category-banners/86241 */
import MountWidget from "discourse/components/mount-widget";

export default class CategoryIcon extends MountWidget {
  widget = "category-icon";
  classNames = ["category-icon-widget-wrapper"];

  buildArgs() {
    return { category: this.category };
  }

  didReceiveAttrs() {
    super.didReceiveAttrs();
    this.queueRerender();
  }
}
