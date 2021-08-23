import { Exclude } from 'class-transformer';
import { cryptPassword } from 'src/cryptHelper';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
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

  @Column()
  gender: GENDER;

  @Column({ nullable: true })
  emoji: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @CreateDateColumn()
  created_at: Date;

  //TODO: onupdate change date auto
  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  async cryptPassword() {
    const plainPassword = this.password;
    const hashedPassword = await cryptPassword(plainPassword);

    this.password = hashedPassword;
  }
}
