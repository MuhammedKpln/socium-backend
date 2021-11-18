import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { hashText } from 'src/cryptHelper';
import { Follower } from 'src/follower/entities/follower.entity';
import { UserLike } from 'src/likes/entities/UserLike.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import {
  AfterLoad,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2,
}

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ unique: true })
  @Field()
  username: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  avatar: string;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true, defaultValue: false })
  blockIncomingCalls: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  gender: Gender;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bio: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ default: false })
  @Field()
  public isEmailConfirmed: boolean;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  public emailConfirmationCode: number;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  forgotPasswordCode: number;

  @CreateDateColumn()
  @Field()
  created_at: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  @Field((_returns) => String, { nullable: true })
  birthday: Date;

  //TODO: onupdate change date auto
  @UpdateDateColumn()
  @Field()
  updated_at: Date;

  @OneToMany(() => PostEntity, (post) => post.user)
  @JoinColumn({
    referencedColumnName: 'user',
  })
  @Field((returns) => [PostEntity])
  posts?: PostEntity[];

  @OneToMany(() => Follower, (follower) => follower.actor)
  @JoinColumn({
    referencedColumnName: 'actor',
  })
  followers?: Follower[];

  @OneToMany(() => Follower, (follower) => follower.user)
  @JoinColumn({
    referencedColumnName: 'user',
  })
  following?: Follower[];

  @OneToMany(() => UserLike, (follower) => follower.user)
  likedPosts?: UserLike[];

  @BeforeInsert()
  @BeforeUpdate()
  async cryptPassword() {
    if (!this.password) return;

    const plainPassword = this.password;
    const hashedPassword = await hashText(plainPassword);

    this.password = hashedPassword;
  }

  @BeforeInsert()
  async generateRandomConfirmationCode() {
    const randomCode = Math.floor(Math.random() * 100000 + 100000);
    this.emailConfirmationCode = randomCode;
  }

  @AfterLoad()
  parseAvatar() {
    if (this.avatar) {
      this.avatar = 'avatars/' + this.avatar + '.webp';
    }
  }

  @AfterUpdate()
  parseAvatarAfterInsert() {
    return this.parseAvatar();
  }
}
