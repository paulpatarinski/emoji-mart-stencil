import { Method, Component, Prop, State } from '@stencil/core';
import { get as freqGet } from '../../lib/emoji-mart/utils/frequently'
import { getData } from '../../lib/emoji-mart/utils'
import { I18N } from '../../lib/emoji-mart/data/I18N';

@Component({
    tag: 'emart-category'
})

export class Category {
    constructor() {
        this.setContainerRef = this.setContainerRef.bind(this)
        this.setLabelRef = this.setLabelRef.bind(this)
    }

    @Prop() categoryId: any;
    @Prop() categoryKey: any;
    @Prop() emojis: any = [];
    @Prop() hasStickyPosition: boolean = true;
    @Prop() name: string;
    @Prop() native: boolean;
    @Prop() perLine: number;
    @Prop() emojiProps: any;
    @Prop() recent: string[];
    @Prop() custom: any;
    @Prop() i18n: any = I18N;

    @State() _parent: any;
    @State() _container: any;
    @State() _margin: any;
    @State() _minMargin: any;
    @State() _label: any;
    @State() _maxMargin: any;
    @State() _top: number;

    @Method()
    getTop() {
        return this._top;
    }

    componentDidLoad() {
        this._parent = this._container.parentNode

        this._margin = 0
        this._minMargin = 0

        this.memoizeSize()
    }

    shouldComponentUpdate(nextProps, nextState) {
        var {
        name,
            perLine,
            native,
            hasStickyPosition,
            emojis,
            emojiProps,
      } = this,
            { skin, size, set } = emojiProps,
            {
        perLine: nextPerLine,
                native: nextNative,
                hasStickyPosition: nextHasStickyPosition,
                emojis: nextEmojis,
                emojiProps: nextEmojiProps,
      } = nextProps,
            { skin: nextSkin, size: nextSize, set: nextSet } = nextEmojiProps,
            shouldUpdate = false

        if (name == 'Recent' && perLine != nextPerLine) {
            shouldUpdate = true
        }

        if (name == 'Search') {
            shouldUpdate = !(emojis == nextEmojis)
        }

        if (
            skin != nextSkin ||
            size != nextSize ||
            native != nextNative ||
            set != nextSet ||
            hasStickyPosition != nextHasStickyPosition
        ) {
            shouldUpdate = true
        }

        return shouldUpdate
    }

    @Method()
    memoizeSize() {
        var { top, height } = this._container.getBoundingClientRect()
        var { top: parentTop } = this._parent.getBoundingClientRect()
        var { height: labelHeight } = this._label.getBoundingClientRect()

        this._top = top - parentTop + this._parent.scrollTop;

        if (height == 0) {
            this._maxMargin = 0
        } else {
            this._maxMargin = height - labelHeight
        }
    }

    @Method()
    handleScroll(scrollTop) {
        var margin = scrollTop - this._top
        margin = margin < this._minMargin ? this._minMargin : margin
        margin = margin > this._maxMargin ? this._maxMargin : margin

        if (margin == this._margin) return

        if (!this.hasStickyPosition) {
            this._label.style.top = `${margin}px`
        }

        this._margin = margin
        return true
    }

    getEmojis() {
        var { emojis } = this

        if (this.name == 'Recent') {
            let { custom } = this
            let frequentlyUsed = this.recent || freqGet(this.perLine)

            if (frequentlyUsed.length) {
                emojis = frequentlyUsed
                    .map(id => {
                        const emoji = custom.filter(e => e.id === id)[0]
                        if (emoji) {
                            return emoji
                        }

                        return id
                    })
                    .filter(id => !!getData(id))
            }

            if (emojis.length === 0 && frequentlyUsed.length > 0) {
                return null
            }
        }

        if (emojis) {
            emojis = emojis.slice(0)
        }

        return emojis
    }

    @Method()
    updateDisplay(display) {
        var emojis = this.getEmojis()

        if (!emojis) {
            return
        }

        this._container.style.display = display
    }

    @Method()
    forceUpdate() {
        //This is a way to force an update https://github.com/ionic-team/stencil/issues/185
        this.i18n = { ...this.i18n };
    }

    setContainerRef(c) {
        this._container = c
    }

    setLabelRef(c) {
        this._label = c
    }

    render() {
        var { categoryId, name, hasStickyPosition, emojiProps, i18n } = this,
            emojis = this.getEmojis(),
            labelStyles = {},
            labelSpanStyles = {},
            containerStyles = {}

        if (!emojis) {
            containerStyles = {
                display: 'none',
            }
        }

        if (!hasStickyPosition) {
            labelStyles = {
                height: 28,
            }

            labelSpanStyles = {
                position: 'absolute',
            }
        }

        return (
            <div
                ref={this.setContainerRef}
                class={`emoji-mart-category ${emojis && !emojis.length
                    ? 'emoji-mart-no-results'
                    : ''}`}
                style={containerStyles}
            >
                <div
                    style={labelStyles}
                    data-name={name}
                    class="emoji-mart-category-label"
                >
                    <span style={labelSpanStyles} ref={this.setLabelRef}>
                        {i18n.categories[categoryId]}
                    </span>
                </div>

                {emojis && emojis.map(emoji => <emart-emoji emoji={emoji} skin={emojiProps.skin} size={emojiProps.size} set={emojiProps.set} sheetSize={emojiProps.sheetSize} forceSize={emojiProps.forceSize} tooltip={emojiProps.tooltip} backgroundImageFn={emojiProps.backgroundImageFn} onOver={emojiProps.onOver} onLeave={emojiProps.onLeave} onClick={emojiProps.onClick}  ></emart-emoji>)}

                {emojis &&
                    !emojis.length && (
                        <div>
                            <div>
                                <emart-emoji
                                    size={38}
                                    emoji='sleuth_or_spy'
                                    backgroundImageFn={emojiProps.backgroundImageFn}
                                    on-over={null}
                                    on-leave={null}
                                    on-click={null}>
                                </emart-emoji>
                            </div>

                            <div class="emoji-mart-no-results-label">{i18n.notfound}</div>
                        </div>
                    )}
            </div>
        )
    }
}