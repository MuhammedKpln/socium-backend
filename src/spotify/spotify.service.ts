import { Injectable } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PBool } from 'src/types';
import { Repository } from 'typeorm';
import { UpdateCurrentTrackDto } from './dtos/UpdateCurrentTrack.dto';
import { SpotifyCurrentlyListening } from './entities/SpotifyListening.entity';

@Injectable()
export class SpotifyService {
  constructor(
    @InjectRepository(SpotifyCurrentlyListening)
    private readonly spotifyRepo: Repository<SpotifyCurrentlyListening>,
  ) {}

  async getUserCurrentTrack(
    userId: number,
  ): Promise<SpotifyCurrentlyListening | false> {
    const user = new User();
    user.id = userId;

    const entity = await this.spotifyRepo.findOne({
      user,
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
      const data = await this.spotifyRepo.save({
        ...currentTrack,
        songName: spotify.songName,
        artistName: spotify.artistName,
        image: spotify.imageUrl,
      });

      return data;
    } else {
      const user = new User();
      user.id = userId;

      const data = await this.spotifyRepo.save({
        songName: spotify.songName,
        artistName: spotify.artistName,
        image: spotify.imageUrl,
        user,
      });

      return data;
    }
  }

  async removeCurrentTrack(userId: number): PBool {
    const user = new User();
    user.id = userId;
    const deleted = await this.spotifyRepo.delete({
      user,
    });

    if (deleted.affected > 0) {
      return true;
    }

    return false;
  }
}
