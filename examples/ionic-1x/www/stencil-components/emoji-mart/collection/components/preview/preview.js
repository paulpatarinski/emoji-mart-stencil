import { getData } from 'emoji-mart/dist-es/utils/index';
export class Preview {
    constructor() {
        this.EMOJI_DATASOURCE_VERSION = "4.0.2";
        this.title = 'Emoji Mart™';
        this.idleEmoji = 'heart_eyes_cat';
        this.emojiProps = {
            native: false,
            skin: 1,
            size: 40,
            set: 'apple',
            sheetSize: 64,
            backgroundImageFn: (set, sheetSize) => `https://unpkg.com/emoji-datasource-${set}@${this.EMOJI_DATASOURCE_VERSION}/img/${set}/sheets-256/${sheetSize}.png`
        };
        this.emoji = null;
    }
    render() {
        if (this.emoji) {
            var emojiData = getData(this.emoji), { emoticons = [] } = emojiData, knownEmoticons = [], listedEmoticons = [];
            emoticons.forEach(emoticon => {
                if (knownEmoticons.indexOf(emoticon.toLowerCase()) >= 0) {
                    return;
                }
                knownEmoticons.push(emoticon.toLowerCase());
                listedEmoticons.push(emoticon);
            });
            return (h("div", { class: "emoji-mart-preview" },
                h("div", { class: "emoji-mart-preview-emoji" },
                    h("emart-emoji", { emoji: this.emoji, native: this.emojiProps.native, skin: this.emojiProps.skin, size: this.emojiProps.size, set: this.emojiProps.set, "sheet-size": this.emojiProps.sheetSize, "force-size": this.emojiProps.forceSize, backgroundImageFn: this.emojiProps.backgroundImageFn })),
                h("div", { class: "emoji-mart-preview-data" },
                    h("div", { class: "emoji-mart-preview-name" }, this.emoji.name),
                    h("div", { class: "emoji-mart-preview-shortnames" }, emojiData.short_names.map(short_name => (h("span", { class: "emoji-mart-preview-shortname" },
                        ":",
                        short_name,
                        ":")))),
                    h("div", { class: "emoji-mart-preview-emoticons" }, listedEmoticons.map(emoticon => (h("span", { class: "emoji-mart-preview-emoticon" }, emoticon)))))));
        }
        else {
            return (h("div", { class: "emoji-mart-preview" },
                h("div", { class: "emoji-mart-preview-emoji" }, this.idleEmoji &&
                    this.idleEmoji.length &&
                    h("emart-emoji", { emoji: this.idleEmoji, native: this.emojiProps.native, skin: this.emojiProps.skin, size: this.emojiProps.size, set: this.emojiProps.set, "sheet-size": this.emojiProps.sheetSize, "force-size": this.emojiProps.forceSize, backgroundImageFn: this.emojiProps.backgroundImageFn })),
                h("div", { class: "emoji-mart-preview-data" },
                    h("span", { class: "emoji-mart-title-label" }, this.title))));
        }
    }
    static get is() { return "emart-preview"; }
    static get properties() { return { "emoji": { "type": "Any", "attr": "emoji" }, "EMOJI_DATASOURCE_VERSION": { "state": true }, "emojiProps": { "type": "Any", "attr": "emoji-props" }, "idleEmoji": { "type": String, "attr": "idle-emoji" }, "skinsProps": { "type": "Any", "attr": "skins-props" }, "title": { "type": String, "attr": "title" } }; }
}
