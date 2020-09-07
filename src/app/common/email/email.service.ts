import { Injectable, Logger } from '@nestjs/common';
import * as Sendgrid from '@sendgrid/mail';

import * as templates from './template/template.json';
import { ITemplate } from './interfaces/template.interface';
import { ConfigService } from '../config/config.service';
import { IDataEmail } from './interfaces/data-email.interface.js';

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    Sendgrid.setApiKey(configService.get('SENDGRID_API_KEY'));
  }

  getTemplates(): ITemplate[] {
    return templates as any;
  }

  async sendMail(data: IDataEmail) {
    let langJsonFile: any;
    let templateData = {};

    if (data.language) {
      langJsonFile = await import(`../assets/i18n/FrontOffice/${data.language}.json`);
      templateData = {
        ...langJsonFile && { greeting: langJsonFile.EMAIL_GREETING },
        ...langJsonFile && { farewell: langJsonFile.EMAIL_FAREWELL },
        ...langJsonFile && { team: langJsonFile.DIGIPILOTE_TEAM },
        ...(langJsonFile && data.template === 'Register') && {
          body: langJsonFile.EMAIL_REGISTER_BODY,
          buttonText: langJsonFile.EMAIL_REGISTER_BUTTON_TEXT,
          registerSubject: langJsonFile.EMAIL_REGISTER_SUBJECT,
        },
        ...(langJsonFile && data.template === 'Invitation') && {
          body: langJsonFile.EMAIL_INVITATION_BODY,
          senderBody: langJsonFile.EMAIL_SENDER_BODY,
          buttonText: langJsonFile.EMAIL_REGISTER_BUTTON_TEXT,
          clickActionText: langJsonFile.EMAIL_CLICK_ACTION_TEXT,
          invitationSubject: langJsonFile.EMAIL_INVITATION_SUBJECT,
        },
        ...(langJsonFile && data.template === 'PasswordModified') && {
          body: langJsonFile.EMAIL_MODIFY_PASSWORD_BODY,
          modifyPasswordSubject: langJsonFile.EMAIL_MODIFY_PASSWORD_SUBJECT,
        },
        ...(langJsonFile && data.template === 'ResetPassword') && {
          body: langJsonFile.EMAIL_RESET_PASSWORD_BODY,
          buttonText: langJsonFile.EMAIL_RESET_PASSWORD_BUTTON,
          resetSubject: langJsonFile.EMAIL_RESET_PASSWORD_SUBJECT,
        },
      };
    }

    const email = {
      to: data.to,
      from: data.from,
      templateId: this.getTemplates().find(t => t.name === data.template).id,
      dynamicTemplateData: {
        ...data.dynamicTemplateData,
        ...templateData,
      },
      hideWarnings: true,
    };

    Sendgrid.send(email).then(m => {
      this.logger.log('Mail sent => ' + m);
    }).catch(error => {
      this.logger.error(error.toString());
    });
  }
}
