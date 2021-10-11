import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

interface IJobData {
  to: string;
  verificationCode: number;
}

@Processor('sendVerificationMail')
export class EmailVerificationConsumer {
  constructor(private mailerService: MailerService) {}

  @Process('confirmation')
  async sendVerificationMail(job: Job<IJobData>, cb) {
    console.log(job);
    await this.mailerService.sendMail({
      to: job.data.to,
      subject: 'Email Dogrulama',
      text: `Email dogrulama kodunuz: ${job.data.verificationCode}`,
    });

    if (cb) {
      console.log('tamamdir');
    }
  }
}
