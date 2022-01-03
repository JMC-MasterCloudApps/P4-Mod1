package es.jmc.mastercloudapps.planner;

import static es.jmc.mastercloudapps.planner.PlannerApplication.NEW_PLANT_QUEUE;
import static es.jmc.mastercloudapps.planner.PlannerApplication.PLANT_PROGRESS_QUEUE;

import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DemoRabbit {

    private final RabbitTemplate rabbitTemplate;

    private int numData;

    @Scheduled(fixedRate = 1000)
    public void sendMessage() {

      String data = "Data " + numData++;

      log.info("publishToQueue '{}': '{}", NEW_PLANT_QUEUE, data);

      rabbitTemplate.convertAndSend(NEW_PLANT_QUEUE, data);
    }

  @RabbitListener(queues = PLANT_PROGRESS_QUEUE, ackMode = "AUTO")
  public void readNewPlantRequest(String message) {

    log.info("Message received in channel '{}': '{}'", PLANT_PROGRESS_QUEUE, message);

  }
}
