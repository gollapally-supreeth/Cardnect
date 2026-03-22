package com.cardnect.repository;

import com.cardnect.model.entity.PhoneOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PhoneOtpRepository extends JpaRepository<PhoneOtp, UUID> {
    Optional<PhoneOtp> findByPhone(String phone);
    void deleteByPhone(String phone);
}
