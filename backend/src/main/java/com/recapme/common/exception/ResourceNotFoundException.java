package com.recapme.common.exception;

public class ResourceNotFoundException extends DomainException {
    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(String.format("%s with identifier '%s' was not found", resourceName, identifier));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
