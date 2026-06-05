package com.solveria.core.iam.domain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "iam_permission")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    protected Permission() {}

    public Permission(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
