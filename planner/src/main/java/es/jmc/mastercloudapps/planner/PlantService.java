package es.jmc.mastercloudapps.planner;

import static es.jmc.mastercloudapps.planner.PlannerApplication.NEW_PLANT_QUEUE;
import static es.jmc.mastercloudapps.planner.PlannerApplication.PLANT_PROGRESS_QUEUE;
import static java.security.SecureRandom.getInstanceStrong;
import static org.springframework.boot.json.JsonParserFactory.getJsonParser;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
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

		Map<String, Object> queueMessage = getJsonParser().parseMap(message);
		queueMessage.put("completed", false);
		queueMessage.put("planning", null);
		queueMessage.put("progress", "25%");
		publish(queueMessage);

		queueMessage.put("progress", "50%");
		publish(queueMessage);

		queueMessage.put("progress", "75%");
		publish(queueMessage);

		queueMessage.put("progress", "100%");
		queueMessage.put("completed", true);
		queueMessage.put("planning", "madrid-sunny-flat");
		publish(queueMessage);
	}

	private String mapToJson(Map<String, Object> queueMessage) {
		try {
			var objectMapper = new ObjectMapper();
			return objectMapper.writeValueAsString(queueMessage);

		} catch (JsonProcessingException e) {
			log.error("Error processing mapToJSON", e);
			return "";
		}
	}

	private void publish(Map<String, Object> queueMessage) throws NoSuchAlgorithmException, InterruptedException {
		Thread.sleep(getInstanceStrong().nextInt(2000));
		log.info("Sending message in channel '{}': '{}'", PLANT_PROGRESS_QUEUE, mapToJson(queueMessage));
		rabbitTemplate.convertAndSend(PLANT_PROGRESS_QUEUE, mapToJson(queueMessage));
	}
}
