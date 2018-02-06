import SVGs from 'emoji-mart/dist-es/svgs/index';
import { I18N } from '../../lib/emoji-mart/data/I18N';
import data from '../../lib/emoji-mart/data/index';
export class Anchors {
    constructor() {
        this.categories = Array.from(data.categories);
        this.i18n = I18N;
        this.onAnchorClick = () => { };
        this.render = () => h("div", { class: "emoji-mart-anchors" }, this.categories.map((category, i) => {
            var { id, name, anchor } = category, isSelected = name == this._selected;
            if (anchor === false) {
                return null;
            }
            //TODO : find equivalent for key={id}
            // TODO: if you click directly on the svg the browser throws an error toUpper undefined
            return (h("span", { title: this.i18n.categories[id], "data-index": i, onClick: this.handleClick, class: `emoji-mart-anchor ${isSelected
                    ? 'emoji-mart-anchor-selected'
                    : ''}`, style: { color: isSelected ? this.color : null } },
                h("div", { innerHTML: this.getSVG(id) }),
                h("span", { class: "emoji-mart-anchor-bar", style: { backgroundColor: this.color } })));
        }));
        this._defaultCategory = this.categories.filter(category => category.first)[0];
        this._selected = this._defaultCategory != null ? this._defaultCategory.name : "";
        this.handleClick = this.handleClick.bind(this);
    }
    getSVG(id) {
        this._SVGs || (this._SVGs = {});
        if (this._SVGs[id]) {
            return this._SVGs[id];
        }
        else {
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
       ${SVGs[id]}
      </svg>`;
            this._SVGs[id] = svg;
            return svg;
        }
    }
    handleClick(e) {
        var index = e.currentTarget.getAttribute('data-index');
        this.onAnchorClick(this.categories[index], index);
    }
    static get is() { return "emart-anchors"; }
    static get properties() { return { "_defaultCategory": { "state": true }, "_selected": { "state": true }, "_SVGs": { "state": true }, "categories": { "type": "Any", "attr": "categories" }, "color": { "type": "Any", "attr": "color" }, "i18n": { "type": "Any", "attr": "i18n" }, "onAnchorClick": { "type": "Any", "attr": "on-anchor-click" } }; }
}
