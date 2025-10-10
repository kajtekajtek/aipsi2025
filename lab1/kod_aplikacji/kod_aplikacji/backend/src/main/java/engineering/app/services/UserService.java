package engineering.app.services;

import java.util.List;

import org.springframework.stereotype.Service;

import engineering.app.models.User;
import engineering.app.repositories.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
