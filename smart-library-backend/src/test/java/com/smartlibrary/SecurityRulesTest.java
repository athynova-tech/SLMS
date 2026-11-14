package com.smartlibrary;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Verifies the server enforces roles (runs against the dev profile and its seeded demo users). */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityRulesTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void anonymousRequestGets401() throws Exception {
        mockMvc.perform(get("/api/books")).andExpect(status().isUnauthorized());
    }

    @Test
    void healthyPublicEndpointsStayOpen() throws Exception {
        mockMvc.perform(get("/api/ebooks")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "member@library.com", roles = "MEMBER")
    void memberCannotListOrCreateUsers() throws Exception {
        mockMvc.perform(get("/api/users")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"X\",\"email\":\"x@y.com\",\"password\":\"password123\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/users/1")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "member@library.com", roles = "MEMBER")
    void memberCannotUseStaffEndpoints() throws Exception {
        mockMvc.perform(post("/api/borrow")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":1,\"bookId\":1}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/dashboard/stats")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "member@library.com", roles = "MEMBER")
    void memberCannotReadAnotherUsersBorrowHistory() throws Exception {
        // Seeded ids: admin = 1, librarian = 2, member = 3.
        mockMvc.perform(get("/api/borrow/user/1")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "librarian@library.com", roles = "LIBRARIAN")
    void librarianMayReadUsersButNotChangeThem() throws Exception {
        mockMvc.perform(get("/api/users")).andExpect(status().isOk());
        mockMvc.perform(delete("/api/users/3")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@library.com", roles = "ADMIN")
    void adminResponsesNeverContainPasswordHashes() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].password").doesNotExist());
    }
}
