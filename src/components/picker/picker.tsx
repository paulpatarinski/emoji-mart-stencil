import { Component, Prop, State, Method, Element } from '@stencil/core';
import 'emoji-mart/dist-es/vendor/raf-polyfill'
import { I18N } from '../../lib/emoji-mart/data/I18N';
 
import data from '../../lib/emoji-mart/data/index' 
 
import store from 'emoji-mart/dist-es/utils/store'
import frequently from 'emoji-mart/dist-es/utils/frequently'
import {deepMerge} from 'emoji-mart/dist-es/utils'
 
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
        this.forceUpdate = this.forceUpdate.bind(this)

        window["emojiMartFrequently"] = frequently;
    }

    @Element() host: HTMLElement

    @State() EMOJI_DATASOURCE_VERSION = "4.0.2";
    @State() _forceUpdate: boolean;
    @State() _loadedCategories = [];

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
    @Prop() skin: any = store.get('skin') || this.skin;
    @Prop() native: any = false;
    @Prop() sheetSize: any = 64;
    @Prop() backgroundImageFn: any = (set, sheetSize) =>
        `https://unpkg.com/emoji-datasource-${set}@${this.EMOJI_DATASOURCE_VERSION}/img/${set}/sheets-256/${sheetSize}.png`;
    @Prop() emojisToShowFilter: any;
    @Prop() showPreview: boolean = true;
    @Prop() showAnchors: boolean = true;
    @Prop() emojiTooltip: any = false;
    @Prop() autoFocus: boolean = false;
    @Prop() custom: any = [];
    @Prop() title: string = "Emoji Mart™";

    _i18n = deepMerge(I18N, this.i18n);
    _categories = [];
    _hideRecent;
    _firstRender = true;
    _firstRenderTimeout;
    _leaveTimeout;
    _hasStickyPosition;
    _preview;
    _categoryRefs: any = {};
    _scroll: any;
    _waitingForPaint: any;
    _scrollTop: any;
    _clientHeight: any;
    _scrollHeight: any;
    _search: any;
    _anchors: any;
    _allCategoriesLoaded: boolean = false;
    _firstCategoryIndex: number = 0;
    _lastCategoryIndex: number = 3;
    _loadOffset: number = 50;
    _isLoading: boolean = false;

    @Method()
    clearSearch() {
        this.handleSearch(null);
        
        if(this._search)
            this._search.clear();
    }

    @Method()
    resetScroll() {
        if (this._scroll && this._scroll.scrollTop)
            this._scroll.scrollTop = 0
    }

    //TODO: Check if event exists in stencil 
    // componentWillReceiveProps(props) {
    //     if (props.skin && !storeGet('skin')) {
    //         this.skin = props.skin;
    //     }
    // }

    componentWillLoad() {
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

        this._categories.unshift(SEARCH_CATEGORY);

        this.loadMore();
    }

    componentDidLoad() {
        if (this._firstRender) {
            //TODO: figure out why this is happening & fix it
            //Calling this causes a weird flicker & shift up of the emojis on mobile
            // this.testStickyPosition()
            this._firstRenderTimeout = setTimeout(() => {
                this._firstRender = false;
            }, 60)
        }
    }

    loadMore() {
        this._isLoading = true;
        //Initially load category 0-3...then load 1 category at a time
        var newCategories = this._categories.slice(this._firstCategoryIndex, this._lastCategoryIndex);
        this._firstCategoryIndex = this._lastCategoryIndex;
        this._lastCategoryIndex = this._lastCategoryIndex + 1;
        //Adding additional categories will automatically trigger a re-render 
        this._loadedCategories = this._loadedCategories.concat(newCategories);
        this._allCategoriesLoaded = this._loadedCategories.length === this._categories.length;
    }

    categoryLoaded(categoryIndex: number, emojisCount: number) {
        console.log(`Category ${categoryIndex} loaded...${emojisCount} emojis`);

        let lastRequestedCategoryIndex = this._firstCategoryIndex - 1;

        if (categoryIndex === lastRequestedCategoryIndex) {
            //Update the categoryRefs(actual component references
            //every time you load more components)
            this._categoryRefs = this.getAllCategoryComponents();
            this.updateCategoriesSize();
            this._isLoading = false;
        }
    }

    componentDidUpdate() {
        //TODO: calling this causes infinte calls to memoize
        // this.updateCategoriesSize()
        // this.handleScroll()
    }

    componentDidUnload() {
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

    handleEmojiLeave() {
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
        if (!this._hideRecent && !this.recent) frequently.add(emoji)

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
            } else if (scrollTop + this._clientHeight >= this._scrollHeight - this._loadOffset) {
                activeCategory = this._categories[this._categories.length - 1]

                if (!this._isLoading && !this._allCategoriesLoaded) {
                    this.loadMore();
                }
            }
        }

        if (activeCategory) {
            let { _anchors } = this,
                { name: categoryName } = activeCategory

            if (_anchors && _anchors.selected != categoryName) {
                _anchors.selected = categoryName
            }
        }

        this._scrollTop = scrollTop
    }

    getAllCategoryComponents() {
        return this.host.querySelectorAll('emart-category');
    }

    handleSearch(emojis) {
        SEARCH_CATEGORY.emojis = emojis

        for (let i = 0, l = this._categoryRefs.length; i < l; i++) {
            let component = this._categoryRefs[i] as any;

            if (component && component.name != 'Search') {
                let display = emojis ? 'none' : 'inherit'
                component.updateDisplay(display)
            }
        }

        this.forceUpdate()

        this.resetScroll();

        this.handleScroll()
    }

    forceUpdate() {
        //This is a way to force an update https://github.com/ionic-team/stencil/issues/185
        this._forceUpdate = !this._forceUpdate;
    }

    handleAnchorClick(category, i) {
        var component = this._categoryRefs[`category-${i}`],
            { _scroll } = this,
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
            this.clearSearch()

            window.requestAnimationFrame(scrollToComponent)
        } else {
            scrollToComponent()
        }
    }

    handleSkinChange(skin) {
        var newState = { skin: skin }

        this.skin = skin;

        store.update(newState)
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
        if(c) {
            this._scroll = c
            this._scrollHeight = this._scroll.scrollHeight
            this._clientHeight = this._scroll.clientHeight
        }
    }


    render() {
        // TODO: calculating the width causes an infinite re-render 
        // width = perLine * (emojiSize + 12) + 12 + 2 + measureScrollbar()
        // return (<p>Hello</p>)

        return (
            <div style={{ width: this.width, ...this.pickerStyle }} class="emoji-mart">
                {/* // TODO : ADD BACK */}

                {this.showAnchors && <div class="emoji-mart-bar">
                    <emart-anchors
                        ref={this.setAnchorsRef}
                        i18n={this._i18n}
                        color={this.color}
                        categories={this._categories}
                        onAnchorClick={this.handleAnchorClick}
                    ></emart-anchors>
                </div>}

                <emart-search
                    ref={this.setSearchRef}
                    onSearch={this.handleSearch}
                    i18n={this._i18n}
                    emojisToShowFilter={this.emojisToShowFilter}
                    include={this.include}
                    exclude={this.exclude}
                    custom={CUSTOM_CATEGORY.emojis}
                    autoFocus={this.autoFocus}
                />

                <div
                    ref={this.setScrollRef}
                    class="emoji-mart-scroll"
                    onScroll={this.handleScroll}
                >
                    {this._loadedCategories.map((category, i) =>
                        (<emart-category
                            categoryKey={category.name}
                            categoryId={category.id}
                            categoryLoaded={(emojisCount) => this.categoryLoaded(i, emojisCount)}
                            name={category.name}
                            emojis={category.emojis}
                            perLine={this.perLine}
                            native={this.native}
                            hasStickyPosition={this._hasStickyPosition}
                            i18n={this._i18n}
                            recent={category.id == RECENT_CATEGORY.id ? this.recent : undefined}
                            custom={
                                category.id == RECENT_CATEGORY.id
                                    ? CUSTOM_CATEGORY.emojis
                                    : undefined
                            }
                            emojiProps={{
                                native: this.native,
                                skin: this.skin,
                                size: this.emojiSize,
                                set: this.set,
                                sheetSize: this.sheetSize,
                                forceSize: this.native,
                                tooltip: this.emojiTooltip,
                                backgroundImageFn: this.backgroundImageFn,
                                onOver: this.handleEmojiOver,
                                onLeave: this.handleEmojiLeave,
                                onClick: this.handleEmojiClick,
                            }}
                            {...{ 'categoryIndex': i }}
                        />)
                    )}
                </div>
                {
                    this.showPreview && (
                        <div class="emoji-mart-bar">
                            <emart-preview
                                ref={this.setPreviewRef}
                                title={this.title}
                                idleEmoji={this.emoji}
                                emojiProps={{
                                    native: this.native,
                                    size: 38,
                                    skin: this.skin,
                                    set: this.set,
                                    sheetSize: this.sheetSize,
                                    backgroundImageFn: this.backgroundImageFn
                                }}
                                skinsProps={{
                                    skin: this.skin,
                                    onChange: this.handleSkinChange,
                                }}
                            />
                        </div>
                    )}
            </div>
        )
    }
}