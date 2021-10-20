import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  OnQueueStalled,
  Process,
  Processor,
} from '@nestjs/bull';
import { DoneCallback, Job } from 'bull';
import { QueueEvents, Queues } from 'src/types';
import { verificationTemplate } from './codeTemplate';

interface IJobData {
  toEmail: string;
  verificationCode: number;
}

@Processor(Queues.ForgotPassword)
export class ForgotPasswordConsumer {
  constructor(private mailerService: MailerService) {}

  @Process(QueueEvents.SendForgotPasswordCode)
  async sendVerificationMail(job: Job<IJobData>, cb: DoneCallback) {
    try {
      const emailTitle = 'Derdevam şifremi unuttum kodunuz.';
      const emailBody = 'Derdevam şifremi unuttum kodunuz.';

      const emailTemplateFile = verificationTemplate(
        job.data.verificationCode,
        emailTitle,
        emailBody,
      );
      await this.mailerService
        .sendMail({
          to: job.data.toEmail,
          subject: emailTitle,
          html: emailTemplateFile,
        })
        .catch((err) => console.log('werrr', err));

      return cb(null, true);
    } catch (error) {
      console.log(error);
      return cb(error, null);
    }
  }

  @OnQueueStalled()
  async onStalled(job: Job<IJobData>) {
    await job.moveToFailed(new Error('User not found'));
    if (job.isFailed()) {
      console.log(job.failedReason);
    }
  }
  @OnQueueActive()
  onActive(job: Job<IJobData>) {
    console.log('(forgot password) Active job: ', job.id);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job<IJobData>, result) {
    console.log('Completed ', job.id, result);
  }
  @OnQueueError()
  async onError(job: Job<IJobData>, error: Error) {
    console.log('Error ', job.id, error.message);
  }

  @OnQueueFailed()
  onFailed(job: Job<IJobData>, error: Error) {
    console.log('Failed ' + job.id, error);
  }
}
