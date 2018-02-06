import { EmojiProps } from '../emoji/emojiProps';
export declare class Preview {
    constructor();
    EMOJI_DATASOURCE_VERSION: string;
    title: string;
    idleEmoji: string;
    emojiProps: EmojiProps;
    skinsProps: object;
    emoji: any;
    render(): JSX.Element;
}
