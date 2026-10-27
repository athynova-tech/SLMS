package com.smartlibrary.service;

import com.smartlibrary.dto.CategoryRequest;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.model.Category;
import com.smartlibrary.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    public Category create(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        category.setDescription(request.description());
        return categoryRepository.save(category);
    }

    public Category update(Long id, CategoryRequest request) {
        Category category = getById(id);
        category.setName(request.name());
        category.setDescription(request.description());
        return categoryRepository.save(category);
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }
}
