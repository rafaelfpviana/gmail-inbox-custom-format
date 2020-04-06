import { gmail_v1 } from 'googleapis';
import { Message } from 'gmail-inbox/lib/Message.interface';
import { FormatMessageInterface } from 'gmail-inbox/lib/FormatMessageInterface.interface';
import { FormatMessage } from 'gmail-inbox/lib/FormatMessage';
import * as psl from 'psl';

interface CustomMessage extends Message {
    xHeaders: Array<gmail_v1.Schema$MessagePartHeader> | undefined;
    allHeaders: Array<gmail_v1.Schema$MessagePartHeader> | undefined;
    domain: string;
    fromName: string;
}
interface FromParts {
    name: string;
    address: string;
    domain: string;
}

export class CustomFormat extends FormatMessage implements FormatMessageInterface {
    private fromRegX: RegExp = /((?:.*) )?\<([\S\.]+@[\S\.]+)\>|([\S\.]+@[\S\.]+)/i;
    format(message: any): Message {
        const headers = message.data.payload?.headers;
        const xHeaders = this.getXHeaders(headers);
        const mainHeaders = ['From', 'To', 'Subject', 'Date'];
        const fromAddress = this.getHeader('From', headers);
        const fromParts = this.extractFromParts(fromAddress!);
        const domain = this.getDomain(fromParts.domain);

        const customMessage: CustomMessage = {
            domain: domain,
            from: fromParts.address,
            fromName: fromParts.name!,
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

    private getDomain(from: string): string {
        let result = psl.parse(from);
        if(this.getParsed(result))
            return result.domain || from;
        else
            return '';
    }

    private getParsed(result: psl.ParsedDomain | psl.ParseError): result is psl.ParsedDomain {
        return (result as psl.ParsedDomain).domain !== undefined;
    }

    private extractFromParts(from: string): FromParts {
        let parts = from.match(this.fromRegX);
        let partsObj: FromParts = { name: '', address: '', domain: '' };
        if (parts === null)
            return partsObj;
        const email = parts[2] || parts[3];
        partsObj = {
            name: (parts[1] || '').trim(),
            address: email,
            domain: email.substring(email.indexOf('@')+1, email.length)
        }
        return partsObj;
    }

}