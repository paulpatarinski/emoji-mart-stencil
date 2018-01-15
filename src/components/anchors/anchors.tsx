import { Component, Prop, State } from '@stencil/core';
import SVGs from '../../lib/emoji-mart/svgs'

@Component({
    tag: 'emart-anchors',
    shadow: true
})

export class Anchors {
    @State() _defaultCategory: any;
    @State() _selected: any;
    @State() _SVGs: any;

    @Prop() categories: any[] = [{ name: 'Search', anchor: false, emojis: null, id: 'search' }, { first: true, id: "recent", name: "Recent" }];
    @Prop() i18n: any = { search: 'Search', notfound: 'No Emoji Found', categories: { activity: "Activity", search: "Search Results" } };
    @Prop() onAnchorClick: any = () => { };
    @Prop() color: any;

    componentDidLoad() {
        console.log(this.categories);
        this._defaultCategory = this.categories.filter(category => category.first)[0];
        this._selected = this._defaultCategory != null ? this._defaultCategory.name : "";
        this.handleClick = this.handleClick.bind(this)
    }

    getSVG(id) {
        console.log('GET SVG' + id);
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
        var { categories, onAnchorClick } = this

        onAnchorClick(categories[index], index)
    }

    render() {
        return (
            <div class="emoji-mart-anchors">
                {this.categories.map((category, i) => {
                    var { id, name, anchor } = category,
                        isSelected = name == this._selected
                    console.log('CATEGORE');
                    console.log(id);
                    console.log(this.i18n.categories[id]);
                    console.log('ANCHOR ' + anchor);
                    if (anchor === false) {
                        return null
                    }
                    //TODO : find equivalent for key={id}
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
                            <div innerHTML={this.getSVG(id)}>

                            </div>
                            <span
                                class="emoji-mart-anchor-bar"
                                style={{ backgroundColor: this.color }}
                            />
                        </span>
                    )
                })}
            </div>
        )
    }
}