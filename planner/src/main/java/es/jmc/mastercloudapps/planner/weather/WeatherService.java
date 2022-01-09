package es.jmc.mastercloudapps.planner.weather;

import static java.security.SecureRandom.getInstanceStrong;

import java.security.NoSuchAlgorithmException;
import java.util.concurrent.CompletableFuture;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class WeatherService {

  @GrpcClient("weatherServer")
  private WeatherServiceGrpc.WeatherServiceBlockingStub weatherServiceGrpc;

  @Async
  public CompletableFuture<String> getWeather(String city) throws InterruptedException, NoSuchAlgorithmException {

    var time = 1000L + getInstanceStrong().nextInt(2000);
    Thread.sleep(time);
    log.info("Weather finished! ({}s)", time/1000.0);

    final var request = GetWeatherRequest.newBuilder().setCity(city).build();
    final var response = weatherServiceGrpc.getWeather(request);
    log.info("WeatherService response: {}", response.getWeather());

    return CompletableFuture.completedFuture(response.getWeather());
  }
}
