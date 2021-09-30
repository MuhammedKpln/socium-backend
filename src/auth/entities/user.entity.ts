import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { hashText } from 'src/cryptHelper';
import { Follower } from 'src/follower/entities/follower.entity';
import { getRandomString } from 'src/helpers/randomString';
import { PostEntity } from 'src/post/entities/post.entity';
import { EmojiPack } from 'src/profile/dtos/edit-profile.dto';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
  JoinColumn,
  AfterLoad,
} from 'typeorm';

enum GENDER {
  'male' = 1,
  'female' = 2,
  'custom' = 3,
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
  gender: GENDER;

  @Column({ nullable: true })
  @Field({ nullable: true })
  emoji: string;

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

  @CreateDateColumn()
  @Field()
  created_at: Date;

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

  @BeforeInsert()
  async cryptPassword() {
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
  parseEmoji() {
    if (this.emoji) {
      this.emoji = `emoji/` + this.emoji;

      return this.emoji;
    }

    function randomInteger(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    this.emoji = `emoji/` + EmojiPack[randomInteger(0, 9)];
  }
}
