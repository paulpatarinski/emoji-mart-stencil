import { Component, Prop, State } from '@stencil/core';
import { getData, unifiedToNative, getSanitizedData } from '../../lib/emoji-mart/utils';

@Component({
    tag: 'emart-emoji',
    styleUrl: '../../lib/emoji-mart/emoji-mart.scss',
    shadow: true
})

export class Emoji {
    @State() EMOJI_DATASOURCE_VERSION = "4.0.2";
    @State() SHEET_COLUMNS = 52;

    // @Prop() children: any;
    @Prop() skin: any = 1;
    @Prop() set: any = 'apple';
    @Prop() sheetSize: any = 64;
    @Prop() native: any = false;
    @Prop() forceSize: any = false;
    @Prop() tooltip: any = false;
    @Prop() backgroundImageFn: any = (set, sheetSize) =>
        `https://unpkg.com/emoji-datasource-${set}@${this.EMOJI_DATASOURCE_VERSION}/img/${set}/sheets-256/${sheetSize}.png`;

    @Prop() size: number;
    @Prop() fallback: any;
    @Prop() html: any;
    @Prop() emoji: any;

    _getPosition = props => {
        var { sheet_x, sheet_y } = this._getData(props),
            multiply = 100 / (this.SHEET_COLUMNS - 1)

        return `${multiply * sheet_x}% ${multiply * sheet_y}%`
    }

    _getData = props => {
        var { emoji, skin, set } = props;
        return getData(emoji, skin, set)
    }

    _getSanitizedData = props => {
        var { emoji, skin, set } = props
        return getSanitizedData(emoji, skin, set)
    }

    _handleClick = (e, props) => {
        if (!props.onClick) {
            return
        }
        var { onClick } = props,
            emoji = this._getSanitizedData(props)

        onClick(emoji, e)
    }

    _handleOver = (e, props) => {
        if (!props.onOver) {
            return
        }
        var { onOver } = props,
            emoji = this._getSanitizedData(props)

        onOver(emoji, e)
    }

    _handleLeave = (e, props) => {
        if (!props.onLeave) {
            return
        }
        var { onLeave } = props,
            emoji = this._getSanitizedData(props)

        onLeave(emoji, e)
    }

    _isNumeric = value => {
        return !isNaN(value - parseFloat(value))
    }

    _convertStyleToCSS = style => {
        let div = document.createElement('div')

        for (let key in style) {
            let value = style[key]

            if (this._isNumeric(value)) {
                value += 'px'
            }

            div.style[key] = value
        }

        return div.getAttribute('style')
    }

    render() {
        let data = this._getData(this)

        if (!data) {
            return null
        }

        //TODO : enabled the passing of children
        let style: any = {};
        let { unified, custom, short_names, imageUrl } = data,
            children = '',
            className = 'emoji-mart-emoji',
            title = null

        if (!unified && !custom) {
            return null
        }

        if (this.tooltip) {
            title = short_names[0]
        }

        if (this.native && unified) {
            className += ' emoji-mart-emoji-native'
            style = { fontSize: this.size }
            children = unifiedToNative(unified)

            if (this.forceSize) {
                style.display = 'inline-block'
                style.width = this.size
                style.height = this.size
            }
        } else if (custom) {
            className += ' emoji-mart-emoji-custom'
            style = {
                width: this.size,
                height: this.size,
                display: 'inline-block',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'contain',
            }
        } else {
            let setHasEmoji = this._getData(this)[`has_img_${this.set}`]

            if (!setHasEmoji) {
                if (this.fallback) {
                    style = { fontSize: this.size }
                    children = this.fallback(data)
                } else {
                    return null
                }
            } else {
                style = {
                    width: `${this.size}px`,
                    height: `${this.size}px`,
                    display: 'inline-block',
                    backgroundImage: `url(${this.backgroundImageFn(
                        this.set,
                        this.sheetSize
                    )})`,
                    backgroundSize: `${100 * this.SHEET_COLUMNS}%`,
                    backgroundPosition: this._getPosition(this),
                }
            }
        }

        if (this.html) {
            style = this._convertStyleToCSS(style)

            return `<span style='${style}' ${title
                ? `title='${title}'`
                : ''} class='${className}'>${children || ''}</span>`
        } else {
            return (
                <span
                    onClick={e => this._handleClick(e, this)}
                    onMouseEnter={e => this._handleOver(e, this)}
                    onMouseLeave={e => this._handleLeave(e, this)}
                    title={title}
                    class={className}
                >
                    <span style={style}>{children}</span>
                </span>
            )
        }
    }
}