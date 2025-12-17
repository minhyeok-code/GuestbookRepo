package org.example.simpleproject.controller;

import lombok.RequiredArgsConstructor;
import org.example.simpleproject.entity.Guestbook;
import org.example.simpleproject.repository.GuestbookRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/book")
@RequiredArgsConstructor
public class GuestbookController {
    private final GuestbookRepository guestbookRepository;

    @GetMapping
    public List<Guestbook> findAll() {
        return guestbookRepository.findAll();
    }

    @GetMapping("/{id}")
    public Guestbook findOne(@PathVariable Long id) {
        return guestbookRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Guestbook createGuestbook(@RequestBody Guestbook guestbook) {
        return guestbookRepository.save(guestbook);
    }

}
