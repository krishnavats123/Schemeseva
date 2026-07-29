package com.schemeseva.config;

import com.schemeseva.model.Scheme;
import com.schemeseva.model.User;
import com.schemeseva.repository.SchemeRepository;
import com.schemeseva.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final SchemeRepository schemeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedSchemes();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@schemeseva.in")) return;
        User admin = User.builder()
                .name("Admin")
                .email("admin@schemeseva.in")
                .password(passwordEncoder.encode("admin123"))
                .role("ADMIN")
                .age(30)
                .state("Delhi")
                .gender("Male")
                .casteCategory("General")
                .occupation("Salaried")
                .notificationsEnabled(false)
                .build();
        userRepository.save(admin);
        log.info("Admin user seeded: admin@schemeseva.in / admin123");
    }

    private void seedSchemes() {
        if (schemeRepository.count() > 0) return;
        log.info("Seeding schemes...");

        List<Scheme> schemes = List.of(
            Scheme.builder()
                .schemeName("PM Scholarship Scheme")
                .ministry("Ministry of Education")
                .description("Scholarship for students pursuing higher education to encourage merit and support underprivileged students.")
                .minAge(17).maxAge(25).maxIncome(600000)
                .allowedGenders(List.of()).allowedCategories(List.of())
                .allowedOccupations(List.of("Student")).allowedStates(List.of())
                .requiredDocuments(List.of("Aadhaar Card","Marksheet","Bank Passbook","Income Certificate"))
                .tags(List.of("Student","Scholarship","Education"))
                .applicationUrl("https://scholarships.gov.in")
                .active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build(),

            Scheme.builder()
                .schemeName("Ayushman Bharat – PMJAY")
                .ministry("Ministry of Health and Family Welfare")
                .description("Health insurance cover of ₹5 lakh per family per year for secondary and tertiary care hospitalisation.")
                .minAge(0).maxAge(100).maxIncome(200000)
                .allowedGenders(List.of()).allowedCategories(List.of())
                .allowedOccupations(List.of()).allowedStates(List.of())
                .requiredDocuments(List.of("Aadhaar Card","Ration Card","Income Certificate"))
                .tags(List.of("Health","Insurance","BPL"))
                .applicationUrl("https://pmjay.gov.in")
                .active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build(),

            Scheme.builder()
                .schemeName("PM Awas Yojana – Urban")
                .ministry("Ministry of Housing and Urban Affairs")
                .description("Credit-linked subsidy scheme to help EWS/LIG/MIG families own a home in urban areas.")
                .minAge(18).maxAge(70).maxIncome(1800000)
                .allowedGenders(List.of()).allowedCategories(List.of())
                .allowedOccupations(List.of()).allowedStates(List.of())
                .requiredDocuments(List.of("Aadhaar Card","Income Certificate","Residence Proof","Bank Passbook"))
                .tags(List.of("Housing","Urban","Home Loan"))
                .applicationUrl("https://pmaymis.gov.in")
                .active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build(),

            Scheme.builder()
                .schemeName("PM Kisan Samman Nidhi")
                .ministry("Ministry of Agriculture")
                .description("Income support of ₹6,000 per year in three equal instalments to small and marginal farmer families.")
                .minAge(18).maxAge(100).maxIncome(0)
                .allowedGenders(List.of()).allowedCategories(List.of())
                .allowedOccupations(List.of("Farmer")).allowedStates(List.of())
                .requiredDocuments(List.of("Aadhaar Card","Land Records","Bank Passbook"))
                .tags(List.of("Farmer","Agriculture","Income Support"))
                .applicationUrl("https://pmkisan.gov.in")
                .active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build(),

            Scheme.builder()
                .schemeName("NSP – Central Sector Scheme")
                .ministry("Ministry of Education")
                .description("Scholarship for students from OBC/SC/ST categories pursuing education beyond class 12.")
                .minAge(17).maxAge(30).maxIncome(450000)
                .allowedGenders(List.of()).allowedCategories(List.of("OBC","SC","ST"))
                .allowedOccupations(List.of("Student")).allowedStates(List.of())
                .requiredDocuments(List.of("Aadhaar Card","Marksheet","Caste Certificate","Bank Passbook","Income Certificate"))
                .tags(List.of("Student","OBC","SC","ST","Scholarship"))
                .applicationUrl("https://scholarships.gov.in")
                .active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build(),

            Scheme.builder()
                .schemeName("Skill India – PMKVY")
                .ministry("Ministry of Skill Development")
                .description("Free skill training and certification for youth to enhance employability and self-employment.")
                .minAge(15).maxAge(45).maxIncome(0)
                .allowedGenders(List.of()).allowedCategories(List.of())
                .allowedOccupations(List.of("Student","Unemployed")).allowedStates(List.of())
                .requiredDocuments(List.of("Aadhaar Card","10th Certificate","Domicile Certificate"))
                .tags(List.of("Skill","Youth","Training","Employment"))
                .applicationUrl("https://pmkvyofficial.org")
                .active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build(),

            Scheme.builder()
                .schemeName("PMJDY – Jan Dhan Yojana")
                .ministry("Ministry of Finance")
                .description("Zero-balance bank account with RuPay debit card, ₹1 lakh accident insurance, and overdraft facility.")
                .minAge(10).maxAge(100).maxIncome(0)
                .allowedGenders(List.of()).allowedCategories(List.of())
                .allowedOccupations(List.of()).allowedStates(List.of())
                .requiredDocuments(List.of("Aadhaar Card","Address Proof"))
                .tags(List.of("Banking","Financial Inclusion","Jan Dhan"))
                .applicationUrl("https://pmjdy.gov.in")
                .active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build(),

            Scheme.builder()
                .schemeName("Stand-Up India Scheme")
                .ministry("Ministry of Finance")
                .description("Bank loans between ₹10 lakh and ₹1 crore to at least one SC/ST and one woman borrower per bank branch.")
                .minAge(18).maxAge(65).maxIncome(0)
                .allowedGenders(List.of("Female")).allowedCategories(List.of("SC","ST"))
                .allowedOccupations(List.of("Self-employed")).allowedStates(List.of())
                .requiredDocuments(List.of("Aadhaar Card","Business Plan","Bank Statement","Caste Certificate"))
                .tags(List.of("Startup","Women","SC","ST","Loan"))
                .applicationUrl("https://standupmitra.in")
                .active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build(),

            Scheme.builder()
                .schemeName("PM Ujjwala Yojana")
                .ministry("Ministry of Petroleum and Natural Gas")
                .description("Free LPG connections to BPL households to reduce dependence on firewood and promote clean cooking fuel.")
                .minAge(18).maxAge(100).maxIncome(100000)
                .allowedGenders(List.of("Female")).allowedCategories(List.of())
                .allowedOccupations(List.of()).allowedStates(List.of())
                .requiredDocuments(List.of("Aadhaar Card","BPL Card","Address Proof"))
                .tags(List.of("Women","BPL","LPG","Rural"))
                .applicationUrl("https://pmuy.gov.in")
                .active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build(),

            Scheme.builder()
                .schemeName("PM SVANidhi – Street Vendor Loan")
                .ministry("Ministry of Housing and Urban Affairs")
                .description("Collateral-free working capital loan of ₹10,000 to ₹50,000 for street vendors affected by COVID-19.")
                .minAge(18).maxAge(65).maxIncome(0)
                .allowedGenders(List.of()).allowedCategories(List.of())
                .allowedOccupations(List.of("Self-employed")).allowedStates(List.of())
                .requiredDocuments(List.of("Aadhaar Card","Vendor Certificate","Bank Passbook"))
                .tags(List.of("Self-employed","Startup","Micro Loan","Street Vendor"))
                .applicationUrl("https://pmsvanidhi.mohua.gov.in")
                .active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build()
        );

        schemeRepository.saveAll(schemes);
        log.info("Seeded {} schemes.", schemes.size());
    }
}
