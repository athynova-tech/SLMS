package com.smartlibrary.controller;

import com.smartlibrary.model.User;
import com.smartlibrary.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> search(@RequestParam String fullName) {
        return ResponseEntity.ok(userService.search(fullName));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getByRole(role));
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody Map<String, String> body) {
        User user = userService.create(
            body.get("fullName"),
            body.get("email"),
            body.get("password"),
            body.getOrDefault("phone", ""),
            body.getOrDefault("role", "MEMBER")
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<User> suspend(@PathVariable Long id) {
        return ResponseEntity.ok(userService.suspend(id));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<User> activate(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activate(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
