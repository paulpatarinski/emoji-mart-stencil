import { Method, Component, Prop, State } from '@stencil/core';
import emojiIndex from '../../lib/emoji-mart/utils/emoji-index'
import { I18N } from '../../lib/emoji-mart/data/I18N';

@Component({
    tag: 'emart-search'
})

export class Search {
    constructor() {
        this.setRef = this.setRef.bind(this)
        this.handleInput = this.handleInput.bind(this)
    }

    @Prop() onSearch: any = () => { };
    @Prop() maxResults: number = 75;
    @Prop() emojisToShowFilter: any = null;
    @Prop() autoFocus: boolean = false;
    @Prop() include: any;
    @Prop() exclude: any;
    @Prop() custom: any = [];
    @Prop() i18n: any = I18N;

    @State() _input: any;

    handleInput() {
        var value = this._input.value

        this.onSearch(
            emojiIndex.search(value, {
                emojisToShowFilter: this.emojisToShowFilter,
                maxResults: this.maxResults,
                include: this.include,
                exclude: this.exclude,
                custom: this.custom,
            })
        )
    }

    setRef(c) {
        this._input = c
    }

    @Method()
    clear() {
        this._input.value = ''
    }

    render = () =>
        <div class="emoji-mart-search">
            <input
                ref={this.setRef}
                type="text"
                onInput={this.handleInput}
                placeholder={this.i18n.search}
                autoFocus={this.autoFocus}
            />
        </div>
}