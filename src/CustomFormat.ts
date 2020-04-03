import { gmail_v1 } from 'googleapis';
import { Message } from 'gmail-inbox/lib/Message.interface';
import { FormatMessageInterface } from 'gmail-inbox/lib/FormatMessageInterface.interface';
import { FormatMessage } from 'gmail-inbox/lib/FormatMessage';

interface CustomMessage extends Message {
    xHeaders: Array<gmail_v1.Schema$MessagePartHeader> | undefined;
    allHeaders: Array<gmail_v1.Schema$MessagePartHeader> | undefined;
}

export class CustomFormat extends FormatMessage implements FormatMessageInterface {
    format(message: any): Message {
        const headers = message.data.payload?.headers;
        const xHeaders = this.getXHeaders(headers);
        const mainHeaders = ['From', 'To', 'Subject', 'Date'];
        const customMessage: CustomMessage = {
            from: this.getHeader('From', headers),
            to: this.getHeader('To', headers),
            subject: this.getHeader('Subject', headers),
            internalDate: message.data.internalDate!,
            receivedOn: this.getHeader('Date', headers),
            historyId: message.data.historyId!,
            labelIds: message.data.labelIds!,
            messageId: message.data.id!,
            snippet: message.data.snippet!,
            threadId: message.data.threadId!,
            xHeaders: xHeaders,
            allHeaders: this.getOtherHeaders(mainHeaders, xHeaders!.map(x => x.name!), headers)
        }
        return customMessage;
    }

    private getXHeaders(
        headers: Array<gmail_v1.Schema$MessagePartHeader> | undefined
    ): Array<gmail_v1.Schema$MessagePartHeader> | undefined {
        if (!headers) {
            return;
        }
        const found = headers.filter(h => h.name!.toLowerCase().startsWith('x-'));
        return found;
    };

    private getOtherHeaders(
        defaultH: Array<string>,
        xH: Array<string>,
        headers: Array<gmail_v1.Schema$MessagePartHeader> | undefined,
    ): Array<gmail_v1.Schema$MessagePartHeader> | undefined {
        if (!headers) {
            return;
        }
        const excluded = defaultH.concat(xH);
        return headers.filter(header => !excluded.includes(header.name!));
    };

}