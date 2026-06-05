package com.ecomovilidad.core.attendance.application;

import com.ecomovilidad.core.attendance.domain.model.AttendanceRecord;
import com.ecomovilidad.core.attendance.port.in.QueryAttendanceUseCase;
import com.ecomovilidad.core.attendance.port.in.RegisterAttendanceUseCase;
import com.ecomovilidad.core.attendance.port.out.AttendanceRepositoryPort;
import com.ecomovilidad.core.shared.domain.TenantId;
import com.ecomovilidad.core.shared.port.out.DomainEventPublisherPort;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class AttendanceApplicationService
        implements RegisterAttendanceUseCase, QueryAttendanceUseCase {

    private final AttendanceRepositoryPort attendanceRepository;
    private final DomainEventPublisherPort eventPublisher;

    public AttendanceApplicationService(AttendanceRepositoryPort attendanceRepository,
                                         DomainEventPublisherPort eventPublisher) {
        this.attendanceRepository = Objects.requireNonNull(attendanceRepository);
        this.eventPublisher = Objects.requireNonNull(eventPublisher);
    }

    // ── RegisterAttendanceUseCase ────────────────────────────────────────

    @Override
    public AttendanceRecord execute(RegisterAttendanceUseCase.Command cmd) {
        // Idempotency: return existing record if already scanned
        return attendanceRepository
                .findByStudentTripAndType(cmd.studentId(), cmd.tripId(),
                        cmd.type(), cmd.tenantId())
                .orElseGet(() -> {
                    var record = AttendanceRecord.register(cmd.tenantId(), cmd.studentId(),
                            cmd.tripId(), cmd.driverId(), cmd.type(), cmd.qrCode());
                    var saved = attendanceRepository.save(record);
                    eventPublisher.publishAll(saved.pullDomainEvents());
                    return saved;
                });
    }

    // ── QueryAttendanceUseCase ───────────────────────────────────────────

    @Override
    public List<AttendanceRecord> byTrip(UUID tripId, TenantId tenantId) {
        return attendanceRepository.findByTrip(tripId, tenantId);
    }

    @Override
    public List<AttendanceRecord> byStudent(UUID studentId, TenantId tenantId) {
        return attendanceRepository.findByStudent(studentId, tenantId);
    }
}
