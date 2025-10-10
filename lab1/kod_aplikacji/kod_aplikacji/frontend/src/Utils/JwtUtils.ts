import {jwtDecode, JwtPayload} from "jwt-decode";

type customJwtPayload = JwtPayload & {
    roles: Role[],
    id: string
}
export type Role = {
    authority: string,

}

export class JwtUtils {
    public static decodeToken(token: string) {
        return jwtDecode<customJwtPayload>(token);
    }
}