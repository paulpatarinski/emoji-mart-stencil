import { Component, Prop, State } from '@stencil/core';
import SVGs from '../../lib/emoji-mart/svgs/index'
import { I18N } from '../../lib/emoji-mart/data/I18N';
import data from '../../lib/emoji-mart/data/index' 
 
@Component({
    tag: 'emart-anchors'
})  

export class Anchors {
    constructor() {
        this._defaultCategory = this.categories.filter(category => category.first)[0];
        this._selected = this._defaultCategory != null ? this._defaultCategory.name : "";
        this.handleClick = this.handleClick.bind(this)
    }

    @State() _defaultCategory: any;
    @State() _selected: any;
    @State() _SVGs: any;

    @Prop() categories: any[] = Array.from(data.categories);
    @Prop() i18n: any = I18N;
    @Prop() onAnchorClick: any = () => { };
    @Prop() color: any;

    getSVG(id) {
        this._SVGs || (this._SVGs = {})

        if (this._SVGs[id]) {
            return this._SVGs[id]
        } else {
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
       ${SVGs[id]}
      </svg>`

            this._SVGs[id] = svg
            return svg
        }
    }

    handleClick(e) {
        var index = e.currentTarget.getAttribute('data-index')

        this.onAnchorClick(this.categories[index], index)
    }

    render = () =>
        <div class="emoji-mart-anchors">
            {this.categories.map((category, i) => {
                var { id, name, anchor } = category,
                    isSelected = name == this._selected

                if (anchor === false) {
                    return null
                }
                //TODO : find equivalent for key={id}
                // TODO: if you click directly on the svg the browser throws an error toUpper undefined
                return (
                    <span
                        title={this.i18n.categories[id]}
                        data-index={i}
                        onClick={this.handleClick}
                        class={`emoji-mart-anchor ${isSelected
                            ? 'emoji-mart-anchor-selected'
                            : ''}`}
                        style={{ color: isSelected ? this.color : null }}
                    >
                        <div innerHTML={this.getSVG(id)} />
                        <span
                            class="emoji-mart-anchor-bar"
                            style={{ backgroundColor: this.color }}
                        />
                    </span>
                )
            })}
        </div>
}