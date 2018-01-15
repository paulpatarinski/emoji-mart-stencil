import { Method, Component, Prop, State } from '@stencil/core';
import Emoji from '../emoji/emoji'
import { getData } from '../../lib/emoji-mart/utils/index';
import { EmojiProps } from '../emoji/emojiProps';

@Component({
 tag: 'emart-preview'
})

export class Preview {
 constructor() {
  this.emoji = null;
 }

 @Prop() title: string;
 @Prop() idleEmoji: string;
 @Prop() emojiProps: EmojiProps;
 @Prop() skinsProps: object;
 //TODO: figure out why this was on state instead of props
 @Prop() emoji: any;

 render() {
  if (this.emoji) {
   var emojiData = getData(this.emoji),
    { emoticons = [] } = emojiData,
    knownEmoticons = [],
    listedEmoticons = []

   emoticons.forEach(emoticon => {
    if (knownEmoticons.indexOf(emoticon.toLowerCase()) >= 0) {
     return
    }

    knownEmoticons.push(emoticon.toLowerCase())
    listedEmoticons.push(emoticon)
   })

   return (
    <div class="emoji-mart-preview">
     <div class="emoji-mart-preview-emoji">
      {/* TODO : figure out if there is an equivalent for ...emojiProps */}
      <emart-emoji emoji={this.emoji} skin={this.emojiProps.skin} set={this.emojiProps.set} sheet-size={this.emojiProps.sheetSize} native={this.emojiProps.native} force-size={this.emojiProps.forceSize} />
     </div>

     <div class="emoji-mart-preview-data">
      <div class="emoji-mart-preview-name">{this.emoji.name}</div>
      <div class="emoji-mart-preview-shortnames">
       {emojiData.short_names.map(short_name => (
        <span class="emoji-mart-preview-shortname">
         :{short_name}:
                </span>
       ))}
      </div>
      <div class="emoji-mart-preview-emoticons">
       {listedEmoticons.map(emoticon => (
        <span class="emoji-mart-preview-emoticon">
         {emoticon}
        </span>
       ))}
      </div>
     </div>
    </div>
   )
  } else {
   return (
    <div class="emoji-mart-preview">
     <div class="emoji-mart-preview-emoji">
      {this.idleEmoji &&
       this.idleEmoji.length &&
       <emart-emoji emoji={this.idleEmoji} skin={this.emojiProps.skin} set={this.emojiProps.set} sheet-size={this.emojiProps.sheetSize} native={this.emojiProps.native} force-size={this.emojiProps.forceSize} size={this.emojiProps.size} />
      }
     </div>

     <div class="emoji-mart-preview-data">
      <span class="emoji-mart-title-label">{this.title}</span>
     </div>

     {/* TODO : Add skins component */}
     {/* <div class="emoji-mart-preview-skins">
      <Skins {...skinsProps} />
     </div> */}
    </div>
   )
  }
 }
}