package engineering.app.config;

import com.fasterxml.jackson.databind.ObjectMapper;

import engineering.app.models.User;
import engineering.app.repositories.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public void logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        Cookie[] cookies = request.getCookies();
        Cookie refreshToken = null;
        boolean refreshTokenFound = false;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refreshToken")) {
                    refreshToken = cookie;
                    refreshTokenFound = true;
                    break;
                }
            }
        }
        if (!refreshTokenFound) {
            response.setStatus(400);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null ||!authHeader.startsWith("Bearer ")) {
            response.setStatus(400);

            return;
        }
        Optional<User> userOptional;
        userOptional = userRepository.findByRefreshToken(refreshToken.getValue());
        if (userOptional.isEmpty()) {
            String username = jwtService.extractUsername(authHeader.substring(7));
            userOptional = userRepository.findByEmail(username);
            if(userOptional.isEmpty()){
                response.setStatus(400);
                return;
            }

        }
        User user = userOptional.get();
        user.setRefreshToken(null);
        userRepository.save(user);
        refreshToken.setSecure(true);
        refreshToken.setHttpOnly(true);
        refreshToken.setMaxAge(0);
        refreshToken.setPath("/");
        response.addCookie(refreshToken);
        SecurityContextHolder.clearContext();


        try {
            new ObjectMapper().writeValue(response.getOutputStream(), "Logout successful");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    }

