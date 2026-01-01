import { Producer, Admin, Partitioners } from 'kafkajs';
import { getKafkaClient } from './config/kafka.config.js'; // Ensure extension is .js if using ESM

let producer: Producer | null = null;
let admin: Admin;

export const connectProducer = async () => {
    try {
        // 1. Get Client from Common Config
        const kafka = getKafkaClient('auth-service');
        
        // 2. Setup Topics (Admin)
        admin = kafka.admin();
        await admin.connect();
        
        const topics = await admin.listTopics();
        if(!topics.includes('send-mail')){
            await admin.createTopics({
                topics: [{ topic: 'send-mail', numPartitions: 1, replicationFactor: 1 }],
            });
            console.log('✅ Topic send-mail created');
        }
        await admin.disconnect();

        // 3. Connect Producer
        producer = kafka.producer({
            createPartitioner: Partitioners.LegacyPartitioner
        });
        await producer.connect();

        console.log('✅ Kafka producer connected');
    }
    catch(error){
        console.error('❌ Error connecting Kafka producer:', error);
    }
};

export const publishToTopic = async (topic: string, message: any) => {
    if(!producer){
        console.error('❌ Producer not connected');
        return;
    }
    try{
        await producer.send({
            topic,
            messages: [
                { value: JSON.stringify(message) }
            ],
        });
    } catch (error) {
        console.error('❌ Error publishing message:', error);
    }
}

export const disconnectProducer = async () => {
    if (producer) {
        await producer.disconnect();
        console.log('🔌 Kafka producer disconnected');
    }
};