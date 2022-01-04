package es.jmc.mastercloudapps.planner;

import static java.security.SecureRandom.getInstanceStrong;

import java.security.NoSuchAlgorithmException;
import java.util.concurrent.CompletableFuture;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TopoService {

  @Async
  CompletableFuture<String> getLandscape() throws NoSuchAlgorithmException, InterruptedException {

    var time = 1000l + getInstanceStrong().nextInt(2000);
    Thread.sleep(time);
    log.info("Landscape finished! ({}s)", time/1000.0);
    // call topo service

    return CompletableFuture.completedFuture("flat");
  }

}
