import {UsersCollection} from "../db/models/user.js";
import {getFullNameFromGoogleTokenPayload} from "../utils/googleOAuth2.js";
import UsersService from "./users.js";
import UserDto from "../dtos/user-dto.js";
import TokensService from "./tokens.js";

class AuthService {
  async loginOrSignupWithGoogle(payload, password = null) {

    let user = await UsersService.getUser(payload.email);

    if (!user) {
      user = await UsersCollection.create({
        email: payload.email,
        name: getFullNameFromGoogleTokenPayload(payload),
        password,
      });
    }

    const userDto = new UserDto(user);
    const tokens = TokensService.generateToken({...userDto});

    const session = await TokensService.saveToken(user._id,tokens);

    return { user, session };
  }
}

export default new AuthService();