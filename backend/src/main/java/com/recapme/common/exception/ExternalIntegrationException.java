package com.recapme.common.exception;

public class ExternalIntegrationException extends DomainException {

    public ExternalIntegrationException(String serviceName, String message) {
        super(String.format("Error integrating with external service '%s': %s", serviceName, message));
    }

    public ExternalIntegrationException(String serviceName, String message, Throwable cause) {
        super(String.format("Error integrating with external service '%s': %s", serviceName, message), cause);
    }
}
