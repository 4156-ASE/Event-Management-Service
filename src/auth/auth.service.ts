import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientsService } from 'src/clients/clients.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private clientsService: ClientsService,
    private jwtService: JwtService,
  ) {}

  /** sign in a client */
  async signIn(values: {
    access_id: string;
    access_secret: string;
  }): Promise<string> {
    const client = await this.clientsService.findOne({
      where: { access_id: values.access_id },
    });

    if (!client) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(
      values.access_secret,
      client.access_secret,
    );

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { sub: client.cid, access_id: client.access_id };

    return await this.jwtService.signAsync(payload);
  }

  /** sign up a client */
  async signUp(values: {
    access_id: string;
    access_secret: string;
  }): Promise<string> {
    let client = await this.clientsService.findOne({
      where: { access_id: values.access_id },
    });

    if (client) {
      throw new ConflictException('Existed access id');
    }

    client = await this.clientsService.create({
      access_id: values.access_id,
      access_secret: values.access_secret,
    });

    const payload = { sub: client.cid, access_id: client.access_id };

    return await this.jwtService.signAsync(payload);
  }
}
