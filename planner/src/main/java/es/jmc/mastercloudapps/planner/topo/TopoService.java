package es.jmc.mastercloudapps.planner.topo;

import static java.security.SecureRandom.getInstanceStrong;

import java.security.NoSuchAlgorithmException;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class TopoService {

  public record Landscape(String id, String landscape){}
  private final TopoClient client;

  @Async
  public CompletableFuture<String> getLandscape(String city) throws NoSuchAlgorithmException, InterruptedException {

    var time = 1000L + getInstanceStrong().nextInt(2000);
    Thread.sleep(time);
    log.info("Landscape finished! ({}s)", time/1000.0);

    Landscape landscape = client.requestLandscape(city);
    log.info("TopoService response: {}", landscape.landscape());

    return CompletableFuture.completedFuture(landscape.landscape());
  }

}
