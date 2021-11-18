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
import { PathLike } from 'fs';
import { ImageUploader } from 'src/helpers/imageUploader';
import { QueueEvents, Queues } from 'src/types';

export interface IMinifyAvatarJob {
  path: PathLike;
  avatarPath: string;
}

@Processor(Queues.MinifyAvatar)
export class MinifyAvatarConsumer {
  @Process(QueueEvents.MinifyAvatar)
  async minify(job: Job<IMinifyAvatarJob>, cb: DoneCallback) {
    const imageHelper = new ImageUploader();
    const { path, avatarPath } = job.data;

    try {
      await imageHelper.minifyImage(path);
      console.log('Minified successfully');
      await imageHelper.removeFile(avatarPath);

      cb(null, true);
    } catch (err) {
      cb(err);
    }
  }

  @OnQueueStalled()
  async onStalled(job: Job<IMinifyAvatarJob>) {
    await job.moveToFailed(new Error('User not found'));
    if (job.isFailed()) {
      console.log(job.failedReason);
    }
  }
  @OnQueueActive()
  onActive(job: Job<IMinifyAvatarJob>) {
    console.log('(Minify Avatar) Active job: ', job.id);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job<IMinifyAvatarJob>, result) {
    console.log('(Minify Avatar) Completed ', job.id, result);
  }
  @OnQueueError()
  async onError(job: Job<IMinifyAvatarJob>, error: Error) {
    console.log('(Minify Avatar) Error ', job.id, error.message);
  }

  @OnQueueFailed()
  onFailed(job: Job<IMinifyAvatarJob>, error: Error) {
    console.log('(Minify Avatar) Failed ' + job.id, error);
  }
}
