package es.jmc.mastercloudapps.planner;

import static java.security.SecureRandom.getInstanceStrong;

import java.security.NoSuchAlgorithmException;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PlanningService {

  public String process(String planning) throws NoSuchAlgorithmException, InterruptedException {

    log.info("processPlanning: '{}'", planning);

    var time = 1000L + getInstanceStrong().nextInt(2000);
    Thread.sleep(time);
    final var alphabetFirstHalf = "^[A-Ma-m].*";
    Pattern stringPattern = Pattern.compile(alphabetFirstHalf);

    planning = stringPattern.matcher(planning).find() ? planning.toLowerCase() : planning.toUpperCase();
    log.info("processPlanning: '{}' ({}s)", planning, time/1000.0);

    return planning;
  }

}
