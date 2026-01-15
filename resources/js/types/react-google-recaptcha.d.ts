declare module 'react-google-recaptcha' {
    import * as React from 'react';

    export interface ReCAPTCHAProps {
        sitekey: string;
        onChange?: (token: string | null) => void;
        onExpired?: () => void;
        onErrored?: () => void;
        size?: 'compact' | 'normal' | 'invisible';
        theme?: 'light' | 'dark';
        tabindex?: number;
        badge?: 'bottomright' | 'bottomleft' | 'inline';
        hl?: string;
    }

    export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {
        reset(): void;
        execute(): void;
        getValue(): string | null;
    }
}
