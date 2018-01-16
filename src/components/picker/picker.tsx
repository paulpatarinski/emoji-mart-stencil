import { Component, Prop, State } from '@stencil/core';
import '../../lib/emoji-mart/vendor/raf-polyfill'
import { I18N } from '../../lib/emoji-mart/data/I18N';

import data from '../../lib/emoji-mart/data'

import { get as storeGet, update as storeUpdate } from '../../lib/emoji-mart/utils/store'
import { add as frequentlyAdd } from '../../lib/emoji-mart/utils/frequently'
import { deepMerge, measureScrollbar } from '../../lib/emoji-mart/utils'

import Emoji from '../emoji/emoji';

const RECENT_CATEGORY = { id: 'recent', name: 'Recent', emojis: null }
const SEARCH_CATEGORY = {
    id: 'search',
    name: 'Search',
    emojis: null,
    anchor: false,
}
const CUSTOM_CATEGORY = { id: 'custom', name: 'Custom', emojis: [] }

@Component({
    tag: 'emart-picker'
})

export class Picker {
    constructor() {
        let allCategories = [].concat(data.categories)

        if (this.custom.length > 0) {
            CUSTOM_CATEGORY.emojis = this.custom.map(emoji => {
                return {
                    ...emoji,
                    // `<Category />` expects emoji to have an `id`.
                    id: emoji.short_names[0],
                    custom: true,
                }
            })

            allCategories.push(CUSTOM_CATEGORY)
        }


        this._hideRecent = true

        if (this.include != undefined) {
            allCategories.sort((a, b) => {
                if (this.include.indexOf(a.id) > this.include.indexOf(b.id)) {
                    return 1
                }

                return 0
            })
        }

        for (
            let categoryIndex = 0;
            categoryIndex < allCategories.length;
            categoryIndex++
        ) {
            const category = allCategories[categoryIndex]
            let isIncluded =
                this.include && this.include.length
                    ? this.include.indexOf(category.id) > -1
                    : true
            let isExcluded =
                this.exclude && this.exclude.length
                    ? this.exclude.indexOf(category.id) > -1
                    : false
            if (!isIncluded || isExcluded) {
                continue
            }

            if (this.emojisToShowFilter) {
                let newEmojis = []

                const { emojis } = category
                for (let emojiIndex = 0; emojiIndex < emojis.length; emojiIndex++) {
                    const emoji = emojis[emojiIndex]
                    if (this.emojisToShowFilter(data.emojis[emoji] || emoji)) {
                        newEmojis.push(emoji)
                    }
                }

                if (newEmojis.length) {
                    let newCategory = {
                        emojis: newEmojis,
                        name: category.name,
                        id: category.id,
                    }

                    this._categories.push(newCategory)
                }
            } else {
                this._categories.push(category)
            }
        }

        let includeRecent =
            this.include && this.include.length
                ? this.include.indexOf(RECENT_CATEGORY.id) > -1
                : true
        let excludeRecent =
            this.exclude && this.exclude.length
                ? this.exclude.indexOf(RECENT_CATEGORY.id) > -1
                : false
        if (includeRecent && !excludeRecent) {
            this._hideRecent = false
            this._categories.unshift(RECENT_CATEGORY)
        }

        if (this._categories[0]) {
            this._categories[0].first = true
        }

        this._categories.unshift(SEARCH_CATEGORY)

        this.setAnchorsRef = this.setAnchorsRef.bind(this)
        this.handleAnchorClick = this.handleAnchorClick.bind(this)
        this.setSearchRef = this.setSearchRef.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
        this.setScrollRef = this.setScrollRef.bind(this)
        this.handleScroll = this.handleScroll.bind(this)
        this.handleScrollPaint = this.handleScrollPaint.bind(this)
        this.handleEmojiOver = this.handleEmojiOver.bind(this)
        this.handleEmojiLeave = this.handleEmojiLeave.bind(this)
        this.handleEmojiClick = this.handleEmojiClick.bind(this)
        this.setPreviewRef = this.setPreviewRef.bind(this)
        this.handleSkinChange = this.handleSkinChange.bind(this)
    }

    @State() EMOJI_DATASOURCE_VERSION = "4.0.2";

    @Prop() recent: any;
    @Prop() include: any;
    @Prop() exclude: any;
    @Prop() onEmojiClicked: any = () => { };
    @Prop() emojiSize: number = 24;
    @Prop() perLine: number = 9;
    @Prop() i18n: any = {};
    @Prop() pickerStyle: any = {};
    @Prop() width: string = "500px";
    @Prop() emoji: string = 'department_store';
    @Prop() color: string = '#ae65c5';
    @Prop() set: string = 'apple';
    @Prop() skin: any = 1;
    @Prop() native: any = false;
    @Prop() sheetSize: any = 64;
    @Prop() backgroundImageFn: any = (set, sheetSize) =>
        `https://unpkg.com/emoji-datasource-${set}@${this.EMOJI_DATASOURCE_VERSION}/img/${set}/sheets-256/${sheetSize}.png`;
    @Prop() emojisToShowFilter: any;
    @Prop() showPreview: boolean = true;
    @Prop() emojiTooltip: any = false;
    @Prop() autoFocus: boolean = false;
    @Prop() custom: any = [];
    @Prop() title: string = "Emoji Mart™";

    @State() _i18n = deepMerge(I18N, this.i18n);
    @State() _state = {
        skin: storeGet('skin') || this.skin,
        firstRender: true,
    };

    @State() _categories = [];
    @State() _hideRecent;
    @State() _firstRender;
    @State() _firstRenderTimeout;
    @State() _leaveTimeout;
    @State() _hasStickyPosition;
    @State() _preview;
    @State() _categoryRefs: any = {};
    @State() _scroll: any;
    @State() _waitingForPaint: any;
    @State() _scrollTop: any;
    @State() _clientHeight: any;
    @State() _scrollHeight: any;
    @State() _search: any;
    @State() _anchors: any;

    //TODO: Check if event exists in stencil 
    componentWillReceiveProps(props) {
        if (props.skin && !storeGet('skin')) {
            this.skin = props.skin;
        }
    }

    //TODO: Check if event exists in stencil 
    componentDidMount() {
        if (this._firstRender) {
            this.testStickyPosition()
            this._firstRenderTimeout = setTimeout(() => {
                this._firstRender = false;
            }, 60)
        }
    }

    // componentDidUpdate() {
    //     //TODO: calling this causes infinte calls to memoize
    //     this.updateCategoriesSize()
    //     this.handleScroll()
    // }

    componentWillUnmount() {
        SEARCH_CATEGORY.emojis = null

        clearTimeout(this._leaveTimeout)
        clearTimeout(this._firstRenderTimeout)
    }

    testStickyPosition() {
        const stickyTestElement = document.createElement('div')

        const prefixes = ['', '-webkit-', '-ms-', '-moz-', '-o-']

        prefixes.forEach(
            prefix => (stickyTestElement.style.position = `${prefix}sticky`)
        )

        this._hasStickyPosition = !!stickyTestElement.style.position.length
    }

    handleEmojiOver(emoji) {
        var { _preview } = this
        if (!_preview) {
            return
        }

        // Use Array.prototype.find() when it is more widely supported.
        const emojiData = CUSTOM_CATEGORY.emojis.filter(
            customEmoji => customEmoji.id === emoji.id
        )[0]
        for (let key in emojiData) {
            if (emojiData.hasOwnProperty(key)) {
                emoji[key] = emojiData[key]
            }
        }
        _preview.emoji = emoji;
        clearTimeout(this._leaveTimeout)
    }

    handleEmojiLeave(emoji) {
        var { _preview } = this;

        if (!_preview) {
            return
        }

        this._leaveTimeout = setTimeout(() => {
            _preview.emoji = null;
        }, 16)
    }

    handleEmojiClick(emoji, e) {
        this.onEmojiClicked(emoji, e)
        if (!this._hideRecent && !this.recent) frequentlyAdd(emoji)

        var component = this._categoryRefs['category-1']
        if (component) {
            let maxMargin = component.maxMargin
            component.forceUpdate()

            window.requestAnimationFrame(() => {
                if (!this._scroll) return
                component.memoizeSize()
                if (maxMargin == component.maxMargin) return

                this.updateCategoriesSize()
                this.handleScrollPaint()

                if (SEARCH_CATEGORY.emojis) {
                    component.updateDisplay('none')
                }
            })
        }
    }

    handleScroll() {
        if (!this._waitingForPaint) {
            this._waitingForPaint = true
            window.requestAnimationFrame(this.handleScrollPaint)
        }
    }

    handleScrollPaint() {
        this._waitingForPaint = false

        if (!this._scroll) {
            return
        }

        let activeCategory = null

        if (SEARCH_CATEGORY.emojis) {
            activeCategory = SEARCH_CATEGORY
        } else {
            var target = this._scroll,
                scrollTop = target.scrollTop,
                scrollingDown = scrollTop > (this._scrollTop || 0),
                minTop = 0

            for (let i = 0, l = this._categories.length; i < l; i++) {
                let ii = scrollingDown ? this._categories.length - 1 - i : i,
                    category = this._categories[ii],
                    component = this._categoryRefs[`category-${ii}`]

                if (component) {
                    let active = component.handleScroll(scrollTop)

                    if (!minTop || component.getTop() < minTop) {
                        if (component.getTop() > 0) {
                            minTop = component.getTop()
                        }
                    }

                    if (active && !activeCategory) {
                        activeCategory = category
                    }
                }
            }

            if (scrollTop < minTop) {
                activeCategory = this._categories.filter(
                    category => !(category.anchor === false)
                )[0]
            } else if (scrollTop + this._clientHeight >= this._scrollHeight) {
                activeCategory = this._categories[this._categories.length - 1]
            }
        }

        if (activeCategory) {
            let { _anchors } = this,
                { name: categoryName } = activeCategory

            if (_anchors.selected != categoryName) {
                _anchors.selected = categoryName
            }
        }

        this._scrollTop = scrollTop
    }

    handleSearch(emojis) {
        SEARCH_CATEGORY.emojis = emojis

        for (let i = 0, l = this._categories.length; i < l; i++) {
            let component = this._categoryRefs[`category-${i}`]

            if (component && component.name != 'Search') {
                let display = emojis ? 'none' : 'inherit'
                component.updateDisplay(display)
            }
        }

        this.forceUpdate()
        this._scroll.scrollTop = 0
        this.handleScroll()
    }

    forceUpdate() {
        //This is a way to force an update https://github.com/ionic-team/stencil/issues/185
        this.i18n = { ...this.i18n };
    }

    handleAnchorClick(category, i) {
        //TODO : figure out why emojis are not being filtered
        var component = this._categoryRefs[`category-${i}`],
            { _scroll, _anchors } = this,
            scrollToComponent = null

        scrollToComponent = () => {
            if (component) {
                let { top } = component

                if (category.first) {
                    top = 0
                } else {
                    top += 1
                }
                _scroll.scrollTop = top
            }
        }

        if (SEARCH_CATEGORY.emojis) {
            this.handleSearch(null)
            this._search.clear()

            window.requestAnimationFrame(scrollToComponent)
        } else {
            scrollToComponent()
        }
    }

    handleSkinChange(skin) {
        var newState = { skin: skin }

        this.skin = skin;

        storeUpdate(newState)
    }

    updateCategoriesSize() {
        for (let i = 0, l = this._categories.length; i < l; i++) {
            let component = this._categoryRefs[`category-${i}`]
            if (component) component.memoizeSize()
        }

        if (this._scroll) {
            let target = this._scroll
            this._scrollHeight = target.scrollHeight
            this._clientHeight = target.clientHeight
        }
    }

    getCategories() {
        return this._firstRender
            ? this._categories.slice(0, 3)
            : this._categories
    }

    setAnchorsRef(c) {
        this._anchors = c
    }

    setSearchRef(c) {
        this._search = c
    }

    setPreviewRef(c) {
        this._preview = c
    }

    setScrollRef(c) {
        this._scroll = c
    }

    setCategoryRef(name, c) {
        if (!this._categoryRefs) {
            this._categoryRefs = {}
        }

        this._categoryRefs[name] = c
    }

    //TODO: something is causing a constant re-render
    render() {
        var {
        perLine,
            emojiSize,
            set,
            sheetSize,
            pickerStyle,
            title,
            emoji,
            native,
            backgroundImageFn,
            emojisToShowFilter,
            showPreview,
            emojiTooltip,
            include,
            exclude,
            recent,
            autoFocus,
      } = this,
            { skin } = this

        // TODO: calculating the width causes an infinite re-render 
        // width = perLine * (emojiSize + 12) + 12 + 2 + measureScrollbar()

        return (
            <div style={{ width: this.width, ...pickerStyle }} class="emoji-mart">
                {/* // TODO : ADD BACK */}

                <div class="emoji-mart-bar">
                    <emart-anchors
                        ref={this.setAnchorsRef}
                        i18n={this._i18n}
                        color={this.color}
                        categories={this._categories}
                        onAnchorClick={this.handleAnchorClick}
                    ></emart-anchors>
                </div>

                <emart-search
                    ref={this.setSearchRef}
                    onSearch={this.handleSearch}
                    i18n={this.i18n}
                    emojisToShowFilter={emojisToShowFilter}
                    include={include}
                    exclude={exclude}
                    custom={CUSTOM_CATEGORY.emojis}
                    autoFocus={autoFocus}
                />

                <div
                    ref={this.setScrollRef}
                    class="emoji-mart-scroll"
                    onScroll={this.handleScroll}
                >
                    {this.getCategories().map((category, i) => {
                        return (
                            <emart-category
                                ref={this.setCategoryRef.bind(this, `category-${i}`)}
                                categoryKey={category.name}
                                categoryId={category.id}
                                name={category.name}
                                emojis={category.emojis}
                                perLine={perLine}
                                native={native}
                                hasStickyPosition={this._hasStickyPosition}
                                i18n={this._i18n}
                                recent={category.id == RECENT_CATEGORY.id ? recent : undefined}
                                custom={
                                    category.id == RECENT_CATEGORY.id
                                        ? CUSTOM_CATEGORY.emojis
                                        : undefined
                                }
                                emojiProps={{
                                    native: native,
                                    skin: skin,
                                    size: emojiSize,
                                    set: set,
                                    sheetSize: sheetSize,
                                    forceSize: native,
                                    tooltip: emojiTooltip,
                                    backgroundImageFn: backgroundImageFn,
                                    onOver: this.handleEmojiOver,
                                    onLeave: this.handleEmojiLeave,
                                    onClick: this.handleEmojiClick,
                                }}
                            />
                        )
                    })}
                </div>
                {
                    showPreview && (
                        <div class="emoji-mart-bar">
                            <emart-preview
                                ref={this.setPreviewRef}
                                title={title}
                                idleEmoji={emoji}
                                emojiProps={{
                                    native: native,
                                    size: 38,
                                    skin: skin,
                                    set: set,
                                    sheetSize: sheetSize,
                                    backgroundImageFn: backgroundImageFn
                                }}
                                skinsProps={{
                                    skin: skin,
                                    onChange: this.handleSkinChange,
                                }}
                            />
                        </div>
                    )}
            </div>
        )
    }
}