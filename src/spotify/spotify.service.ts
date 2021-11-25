import { Injectable } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { SpotifyCurrentlyListening } from '@prisma/client';
import { User } from 'src/auth/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { PBool } from 'src/types';
import { Repository } from 'typeorm';
import { UpdateCurrentTrackDto } from './dtos/UpdateCurrentTrack.dto';

@Injectable()
export class SpotifyService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserCurrentTrack(
    userId: number,
  ): Promise<SpotifyCurrentlyListening | false> {
    const entity = await this.prisma.spotifyCurrentlyListening.findFirst({
      where: {
        userId,
      },
    });

    if (entity) {
      return entity;
    }

    return false;
  }

  async updateUserCurrentTrack(
    userId: number,
    spotify: UpdateCurrentTrackDto,
  ): Promise<SpotifyCurrentlyListening> {
    const currentTrack = await this.getUserCurrentTrack(userId);

    if (currentTrack) {
      const data = await this.prisma.spotifyCurrentlyListening.update({
        where: {
          id: currentTrack.id,
        },
        data: {
          songName: spotify.songName,
          artistName: spotify.artistName,
          image: spotify.imageUrl,
        },
      });

      return data;
    } else {
      const data = await this.prisma.spotifyCurrentlyListening.create({
        data: {
          songName: spotify.songName,
          artistName: spotify.artistName,
          image: spotify.imageUrl,
          userId,
        },
      });

      return data;
    }
  }

  async removeCurrentTrack(userId: number): PBool {
    const deleted = await this.prisma.spotifyCurrentlyListening.delete({
      where: {
        userId,
      },
    });

    if (deleted) {
      return true;
    }

    return false;
  }
}
