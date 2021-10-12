import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { DoneCallback, Job } from 'bull';
import { verificationTemplate } from './verificationTemplate';

interface IJobData {
  to: string;
  verificationCode: number;
}

@Processor('sendVerificationMail')
export class EmailVerificationConsumer {
  constructor(private mailerService: MailerService) {}

  @Process('confirmation')
  async sendVerificationMail(job: Job<IJobData>, cb: DoneCallback) {
    try {
      const emailTemplateFile = verificationTemplate(job.data.verificationCode);
      await this.mailerService
        .sendMail({
          to: job.data.to,
          subject: 'Derdevam E-Posta Doğrulama Kodunuz',
          html: emailTemplateFile,
        })
        .catch((err) => console.log('werrr', err));

      return cb(null, true);
    } catch (error) {
      console.log(error);
      return cb(error, null);
    }
  }
}
