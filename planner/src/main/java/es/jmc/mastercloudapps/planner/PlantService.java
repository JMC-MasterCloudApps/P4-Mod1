package es.jmc.mastercloudapps.planner;

import static es.jmc.mastercloudapps.planner.PlannerApplication.NEW_PLANT_QUEUE;
import static es.jmc.mastercloudapps.planner.PlannerApplication.PLANT_PROGRESS_QUEUE;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class PlantService {

	private final RabbitTemplate rabbitTemplate;

	@RabbitListener(queues = NEW_PLANT_QUEUE, ackMode = "AUTO")
	public void readNewPlantRequest(String message) throws InterruptedException, NoSuchAlgorithmException {

		log.info("Message received in channel '{}': '{}'", NEW_PLANT_QUEUE, message);
		var random = SecureRandom.getInstanceStrong().nextInt(2000);
		Thread.sleep(random);
		notifyNewPlantProgress("[{" + random + "}] Más done que Al Capone!");
	}

	public void notifyNewPlantProgress(String message) {

		log.info("Sending message in channel '{}': '{}'", PLANT_PROGRESS_QUEUE, message);
		rabbitTemplate.convertAndSend(PLANT_PROGRESS_QUEUE, "Ella es callaitaaaaaa.");
	}
}
