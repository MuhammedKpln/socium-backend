import { Exclude } from 'class-transformer';
import { hashText } from 'src/cryptHelper';
import { Follower } from 'src/follower/entities/follower.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
  JoinColumn,
} from 'typeorm';

enum GENDER {
  'male' = 1,
  'female' = 2,
  'custom' = 3,
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  gender: GENDER;

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  bio: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ default: false })
  public isEmailConfirmed: boolean;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  public emailConfirmationCode: number;

  @CreateDateColumn()
  created_at: Date;

  //TODO: onupdate change date auto
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PostEntity, (post) => post.user)
  @JoinColumn({
    referencedColumnName: 'user',
  })
  posts?: PostEntity[];

  @OneToMany(() => Follower, (follower) => follower.user)
  @JoinColumn({
    referencedColumnName: 'user',
  })
  followers?: Follower[];

  @OneToMany(() => Follower, (follower) => follower.actor)
  @JoinColumn({
    referencedColumnName: 'actor',
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
}
